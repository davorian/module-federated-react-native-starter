#!/bin/bash

# Default values
DIR=""
OUTPUT_FILE="recreate-project-structure.sh"
OMIT_ITEMS=(".sh", "node_modules", "Pods", "build")  # Default omit list includes ".sh" files

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --omit)
            # Check if the next argument is provided for omitting items
            if [[ -z "$2" || "$2" == --* ]]; then
                echo "Warning: --omit specified but no arguments provided. No additional files or directories will be omitted."
                shift 1
            else
                IFS=',' read -ra ADDITIONAL_OMIT_ITEMS <<< "$2"
                OMIT_ITEMS+=("${ADDITIONAL_OMIT_ITEMS[@]}")
                shift 2
            fi
            ;;
        --includeShellScripts)
            OMIT_ITEMS=("${OMIT_ITEMS[@]/.sh}")  # Remove .sh from omit list
            shift
            ;;
        *)
            # Capture the first positional argument as the directory if not already set
            if [[ -z "$DIR" ]]; then
                DIR="$1"
            fi
            shift
            ;;
    esac
done

# Default to current directory if DIR is still empty
DIR="${DIR:-.}"

# Verify that the directory exists
if [[ ! -d "$DIR" ]]; then
    echo "Error: The directory $DIR does not exist."
    exit 1
fi

# Write the initial header to the output file
{
    echo "#!/bin/bash"
    echo "# This script recreates the directory and file structure of $DIR with content"
    echo ""
} > "$OUTPUT_FILE"

# Function to check if a file or directory should be omitted
should_omit() {
    local file="$1"
    local base_name
    base_name=$(basename -- "$file")  # Get the filename without path

    for omit_item in "${OMIT_ITEMS[@]}"; do
        # Omit if the exact name matches or if the file has the specified suffix
        if [[ "$base_name" == "$omit_item" || "$base_name" == *"$omit_item" ]]; then
            return 0
        fi
    done
    return 1
}

# Function to generate the recreate script with directory and file content
generate_script_with_content() {
    local directory="$1"
    local parent_path="$2"

    # Use find to handle filenames with special characters reliably, using -- to ensure paths are treated correctly
    find -- "$directory" -mindepth 1 -maxdepth 1 -print0 | while IFS= read -r -d '' file; do
        # Get the relative path for the current file or directory
        local relative_path="${parent_path}/$(basename -- "$file")"

        # Check if the item is a directory
        if [ -d "$file" ]; then
            # Check if the directory should be omitted
            if should_omit "$file"; then
                continue
            fi
            # Write the command to create the directory
            echo "mkdir -p \"$relative_path\"" >> "$OUTPUT_FILE"
            # Recursively process subdirectories, passing the updated parent path
            generate_script_with_content "$file" "$relative_path"
        elif [ -f "$file" ]; then
            # Check if the file should be omitted based on exact name or suffix
            if should_omit "$file"; then
                continue
            fi
            # Write the command to create the file with content using optimized redirection
            {
                echo "cat << 'EOF' > \"$relative_path\""
                cat "$file"
                echo "EOF"
            } >> "$OUTPUT_FILE"
        fi
    done
}

# Start generating the script from the base directory
generate_script_with_content "$DIR" "$(basename -- "$DIR")"

# Add execute permissions to the generated script
chmod +x "$OUTPUT_FILE"

echo "The file structure recreation script with content has been written to $OUTPUT_FILE."

# Function to update package.json scripts
update_package_json_scripts() {
    # Export variables for envsubst
    export WEB_APPS="$(echo "$web_apps" | tr ' ' ',')"
    export MOB_APPS="$(echo "$mob_apps" | tr ' ' ',')"
    export ALL_APPS="$(echo "$web_apps $mob_apps" | tr ' ' ',')"

    # Generate the new scripts section using envsubst
    envsubst < "scripts.json.template" > "scripts-tmp.json"

    # Merge the new scripts into package.json using jq
    jq -s '.[0] * .[1]' "package.json" "scripts-tmp.json" > "package.json.tmp" && mv "package.json.tmp" "package.json"
    rm "scripts-tmp.json"
}

# Function to update App.tsx for mobile host
update_mobile_host_app() {
    # Export variables for envsubst
    export REMOTE_IMPORTS="$REMOTE_IMPORTS"
    export REMOTE_SCREENS="$REMOTE_SCREENS"

    # Generate the new App.tsx using envsubst
    envsubst < "app.tsx.template" > "apps/$MOB_HOST/src/app/App.tsx"
}

# Function to update mobile remote App.tsx
update_mobile_remote_app() {
    local mob_remote="$1"
    export REMOTE_NAME="$mob_remote"
    
    # Generate the new App.tsx using envsubst
    envsubst < "app.tsx.remote.template" > "apps/$mob_remote/src/app/App.tsx"
}

# Function to escape JSON string for envsubst
escape_for_envsubst() {
    echo "$1" | sed 's/\$/\\$/g'
}

# Function to validate directory exists
validate_directory() {
    local dir="$1"
    if [[ ! -d "$dir" ]]; then
        echo "Error: Directory '$dir' does not exist" >&2
        return 1
    fi
    return 0
}

# Function to validate template exists
validate_template() {
    local template="$TEMPLATE_DIR/$1"
    if [[ ! -f "$template" ]]; then
        echo "Error: Template '$template' does not exist" >&2
        return 1
    fi
    return 0
}

# Function to validate shared type
validate_shared_type() {
    local shared_type="$1"
    if [[ "$shared_type" != "exposes" && "$shared_type" != "remotes" ]]; then
        echo "Error: Invalid shared_type '$shared_type'. Must be either 'exposes' or 'remotes'" >&2
        return 1
    fi
    return 0
}

# Function to generate modulefederation config with validation
generate_modulefederation_config() {
    local target_dir="$1"
    local app_name="$2"
    local shared_type="$3"
    local app_entry="$4"

    # Validate all parameters are provided
    if [[ -z "$target_dir" || -z "$app_name" || -z "$shared_type" || -z "$app_entry" ]]; then
        echo "Error: Missing required parameters for generate_modulefederation_config" >&2
        echo "Usage: generate_modulefederation_config target_dir app_name shared_type app_entry" >&2
        return 1
    fi

    # Validate directory exists or can be created
    if [[ ! -d "$target_dir" ]]; then
        echo "Warning: Target directory '$target_dir' does not exist, attempting to create it..." >&2
        mkdir -p "$target_dir" || {
            echo "Error: Failed to create directory '$target_dir'" >&2
            return 1
        }
    fi

    # Validate template exists
    validate_template "modulefederation.config.js.template" || return 1

    # Validate shared_type
    validate_shared_type "$shared_type" || return 1

    # Export variables for envsubst
    export APP_NAME="$app_name"
    export SHARED_TYPE="$shared_type"
    export APP_ENTRY="$app_entry"

    # Generate the config using envsubst
    envsubst < "$TEMPLATE_DIR/modulefederation.config.js.template" > "$target_dir/modulefederation.config.js" || {
        echo "Error: Failed to generate modulefederation.config.js" >&2
        return 1
    }

    # Validate the generated file exists and is not empty
    if [[ ! -s "$target_dir/modulefederation.config.js" ]]; then
        echo "Error: Generated modulefederation.config.js is empty or does not exist" >&2
        return 1
    }

    return 0
}

# Function to create modulefederation.config.js for web projects - host
create_web_host_mf_config() {
    local app_name="$1"
    local project_root="$2"
    
    # Validate parameters
    if [[ -z "$app_name" || -z "$project_root" ]]; then
        echo "Error: Missing required parameters for create_web_host_mf_config" >&2
        echo "Usage: create_web_host_mf_config app_name project_root" >&2
        return 1
    }

    # Validate project root exists
    validate_directory "$project_root" || return 1
    
    generate_modulefederation_config "$project_root/$app_name" "$app_name" "remotes" "App"
}

# Function to create modulefederation.config.js for web projects - remotes
create_web_remote_mf_config() {
    local app_name="$1"
    local project_root="$2"
    
    # Validate parameters
    if [[ -z "$app_name" || -z "$project_root" ]]; then
        echo "Error: Missing required parameters for create_web_remote_mf_config" >&2
        echo "Usage: create_web_remote_mf_config app_name project_root" >&2
        return 1
    }

    # Validate project root exists
    validate_directory "$project_root" || return 1
    
    generate_modulefederation_config "$project_root/$app_name" "$app_name" "exposes" "App"
}

# Function to create modulefederation.config.js for mobile projects
create_mobile_mf_config() {
    local target_dir="$1"
    local app_name="$2"
    local shared_type="$3"
    local app_entry="$4"
    
    # Validate parameters
    if [[ -z "$target_dir" || -z "$app_name" || -z "$shared_type" || -z "$app_entry" ]]; then
        echo "Error: Missing required parameters for create_mobile_mf_config" >&2
        echo "Usage: create_mobile_mf_config target_dir app_name shared_type app_entry" >&2
        return 1
    }

    # Validate shared_type
    validate_shared_type "$shared_type" || return 1
    
    generate_modulefederation_config "$target_dir" "$app_name" "$shared_type" "$app_entry"
}

# Function to generate web mf configs with validation
generate_web_mf_configs() {
    local project_root="$1"
    local web_host="$2"
    shift 2
    local web_remotes=("$@")

    # Validate parameters
    if [[ -z "$project_root" || -z "$web_host" ]]; then
        echo "Error: Missing required parameters for generate_web_mf_configs" >&2
        echo "Usage: generate_web_mf_configs project_root web_host [web_remotes...]" >&2
        return 1
    }

    # Validate project root exists
    validate_directory "$project_root" || return 1

    # Generate host config
    echo "Generating module federation config for web host: $web_host"
    create_web_host_mf_config "$web_host" "$project_root" || {
        echo "Error: Failed to generate web host config for $web_host" >&2
        return 1
    }

    # Generate remote configs
    for remote in "${web_remotes[@]}"; do
        echo "Generating module federation config for web remote: $remote"
        create_web_remote_mf_config "$remote" "$project_root" || {
            echo "Error: Failed to generate web remote config for $remote" >&2
            return 1
        }
    done

    return 0
}

# Function to generate mobile mf configs with validation
generate_mobile_mf_configs() {
    local project_root="$1"
    local mob_host="$2"
    shift 2
    local mob_remotes=("$@")

    # Validate parameters
    if [[ -z "$project_root" || -z "$mob_host" ]]; then
        echo "Error: Missing required parameters for generate_mobile_mf_configs" >&2
        echo "Usage: generate_mobile_mf_configs project_root mob_host [mob_remotes...]" >&2
        return 1
    }

    # Validate project root exists
    validate_directory "$project_root" || return 1

    # Generate host config
    echo "Generating module federation config for mobile host: $mob_host"
    create_mobile_mf_config "$project_root/$mob_host" "$mob_host" "remotes" "App" || {
        echo "Error: Failed to generate mobile host config for $mob_host" >&2
        return 1
    }

    # Generate remote configs
    for remote in "${mob_remotes[@]}"; do
        echo "Generating module federation config for mobile remote: $remote"
        create_mobile_mf_config "$project_root/$remote" "$remote" "exposes" "App" || {
            echo "Error: Failed to generate mobile remote config for $remote" >&2
            return 1
        }
    done

    return 0
}

# Backward compatible wrapper with validation
generate_mf_config() {
    local target_dir="$1"
    local app_name="$2"
    local shared_type="$3"
    local app_entry="$4"

    # Validate parameters
    if [[ -z "$target_dir" || -z "$app_name" || -z "$shared_type" || -z "$app_entry" ]]; then
        echo "Error: Missing required parameters for generate_mf_config" >&2
        echo "Usage: generate_mf_config target_dir app_name shared_type app_entry" >&2
        return 1
    }

    generate_modulefederation_config "$target_dir" "$app_name" "$shared_type" "$app_entry"
}

# --- Remove nx-mf-workspace if it exists ---
if [[ -d "nx-mf-workspace" ]]; then
    echo "nx-mf-workspace directory already exists. Removing it..."
    rm -rf nx-mf-workspace
fi

# --- When creating a new Nx workspace, auto-confirm prompts and enable remote caching ---
# Example usage (replace as needed in your script):
# npx create-nx-workspace@latest nx-mf-workspace --preset=apps --nxCloud=false --yes

# If you have a yarn install step that prompts for remote caching, use:
# yarn install --yes

# If you use npx or nx commands that prompt for remote caching, add --nxCloud=true or --yes as appropriate. 
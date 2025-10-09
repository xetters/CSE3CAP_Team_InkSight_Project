### THIS BOT CAN BE USED TO SEND ALL OF THE PROJECT FILES TO AN AI FOR TROUBLESHOOTING OR FEATURE DESIGN

import os
import sys


def should_include_file(file_path, script_name):
    """
    Determine if a file should be included based on the rules.
    
    Args:
        file_path: Full path to the file
        script_name: Name of this script to exclude itself
    
    Returns:
        bool: True if file should be included, False otherwise
    """
    file_name = os.path.basename(file_path)
    _, ext = os.path.splitext(file_name)
    
    # Exclude the script itself (case-insensitive)
    if file_name.lower() == script_name.lower():
        return False
    
    # Include only specific extensions
    if ext.lower() in ['.py', '.html', '.css', '.js']:
        return True
    
    # Ignore everything else
    return False


def combine_project_files():
    """
    Main function to combine all project files into a single output file.
    """
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    script_name = os.path.basename(__file__)
    output_file = os.path.join(script_dir, 'combined_output.txt')
    
    print(f"Starting scan from: {script_dir}")
    print(f"Output will be saved to: {output_file}")
    
    files_processed = 0
    files_skipped = 0
    
    # Directories to ignore
    ignored_dirs = {'node_modules', 'venv', '__pycache__', '.git', 'dist', 'build', '.venv', 'env'}
    
    with open(output_file, 'w', encoding='utf-8') as outfile:
        # Walk through all directories starting from script directory
        for root, dirs, files in os.walk(script_dir):
            # Remove ignored directories from the walk
            dirs[:] = [d for d in dirs if d not in ignored_dirs]
            
            for file in files:
                file_path = os.path.join(root, file)
                
                # Check if file should be included
                if should_include_file(file_path, script_name):
                    try:
                        # Read file contents
                        with open(file_path, 'r', encoding='utf-8') as infile:
                            content = infile.read()
                        
                        # Write header with file path
                        relative_path = os.path.relpath(file_path, script_dir)
                        outfile.write(f"----- {relative_path} -----\n")
                        outfile.write(content)
                        outfile.write("\n\n")
                        
                        files_processed += 1
                        print(f"✓ Included: {relative_path}")
                        
                    except Exception as e:
                        files_skipped += 1
                        print(f"⚠ Warning: Could not read {file_path}: {e}")
    
    print(f"\n{'='*50}")
    print(f"Scan complete!")
    print(f"Files processed: {files_processed}")
    print(f"Files skipped: {files_skipped}")
    print(f"Output saved to: {output_file}")
    print(f"{'='*50}")


if __name__ == "__main__":
    combine_project_files()
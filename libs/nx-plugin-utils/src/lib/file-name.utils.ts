
export function convertToKebabCase(inputStr: string): string {
    return (
      inputStr
        // Remove slugs and convert to lower case
        .replace(/\[.*?\]/g, '')
        .toLowerCase()
        // Convert snake_case to kebab-case
        .replace(/_/g, '-')
        // Convert PascalCase to kebab-case
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        // Convert paths to kebab-case
        .replace(/\//g, '-')
        // Remove any non-alphanumeric, non-hyphen characters
        .replace(/[^a-z0-9-]/g, '')
    );
  }
  
  export function convertKebabToPascal(kebabName: string): string {
    return kebabName.replace(/(^\w|-\w)/g, (part) =>
      part.replace(/-/, '').toUpperCase()
    );
  }
  
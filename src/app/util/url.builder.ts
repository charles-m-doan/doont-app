export class UrlBuilder {
    // DEFAULTS
    public static readonly PATH_SEPARATOR: string = "/"
    public static readonly API_FETCH_BASE: string = "https://api.github.com"; // {host}
    public static readonly FILE_FETCH_BASE: string = "https://raw.githubusercontent.com"; // {host}
    public static readonly GH_OWNER: string = "charles-m-doan"; // {owner}
    public static readonly GH_REPO: string = "doont"; // {repo}
    public static readonly GH_BRANCH: string = "main"; // {branch}
    public static readonly DEFAULT_DATA_FILE: string = "Doont.xlsx"; // {file}
    public static readonly DEFAULT_TEST_DATA_FILE: string = "test.txt"; // {file}

    // TOKENS
    public static readonly HOST_TOKEN: string = "{host}";
    public static readonly OWNER_TOKEN: string = "{owner}";
    public static readonly REPO_TOKEN: string = "{repo}";
    public static readonly BRANCH_TOKEN: string = "{branch}";
    public static readonly SHA_TOKEN: string = "{sha}";
    public static readonly FILE_TOKEN: string = "{file}";

    // TEMPLATES
    public static readonly URL_TEMPLATE_LATEST_SHA: string = "{host}/repos/{owner}/{repo}/commits/{branch}";
    public static readonly URL_TEMPLATE_FILE_LIST: string = "{host}/repos/{owner}/{repo}/git/trees/{branch}?recursive=1";
    public static readonly URL_TEMPLATE_FILE_CONTENTS: string = "{host}/{owner}/{repo}/{sha}/{file}";

    // LITERALS
    public static readonly URL_TEMPLATE_FETCH_LATEST_SHA_LIT: string = "https://api.github.com/repos/charles-m-doan/doont/commits/main";

    public static readonly URL_TEMPLATE_FETCH_FILE_LIST_LIT: string = "https://api.github.com/repos/charles-m-doan/doont/git/trees/main?recursive=1";

    public static readonly URL_TEMPLATE_FETCH_FILE_CONTENTS_LIT: string = "https://raw.githubusercontent.com/charles-m-doan/doont/b1d964a784d49498e686a71ba1fa2f2604f47431/test.txt";

    public static getShaFetchUrl(): string {
        return '';
    }

}

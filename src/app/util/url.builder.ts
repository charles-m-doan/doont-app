import { Replacement, TemplateUtil } from "./template.util";

export class UrlBuilder {
    // DEFAULTS
    public static readonly PATH_SEPARATOR: string = '/';
    public static readonly API_FETCH_BASE: string = 'https://api.github.com'; // {host}
    public static readonly FILE_FETCH_BASE: string = 'https://raw.githubusercontent.com'; // {host}
    public static readonly GH_OWNER: string = 'charles-m-doan'; // {owner}
    public static readonly GH_REPO: string = 'doont'; // {repo}
    public static readonly GH_BRANCH: string = 'main'; // {branch}
    public static readonly DEFAULT_DATA_FILE: string = 'Doont.xlsx'; // {file}
    public static readonly DEFAULT_TEST_DATA_FILE: string = 'test.txt'; // {file}
    // TOKENS
    public static readonly HOST_TOKEN: string = '{host}';
    public static readonly OWNER_TOKEN: string = '{owner}';
    public static readonly REPO_TOKEN: string = '{repo}';
    public static readonly BRANCH_TOKEN: string = '{branch}';
    public static readonly SHA_TOKEN: string = '{sha}';
    public static readonly FILE_TOKEN: string = '{file}';
    // TEMPLATES
    public static readonly URL_TEMPLATE_LATEST_SHA: string = '{host}/repos/{owner}/{repo}/commits/{branch}';
    public static readonly URL_TEMPLATE_FILE_LIST: string = '{host}/repos/{owner}/{repo}/git/trees/{branch}?recursive=1';
    public static readonly URL_TEMPLATE_FILE_CONTENTS: string = '{host}/{owner}/{repo}/{sha}/{file}';

    public static getLatestShaUrl(): string {
        const template: string = UrlBuilder.URL_TEMPLATE_LATEST_SHA;
        const replacements: Replacement[] = [
            { token: UrlBuilder.HOST_TOKEN, value: UrlBuilder.API_FETCH_BASE, all: true },
            { token: UrlBuilder.OWNER_TOKEN, value: UrlBuilder.GH_OWNER, all: true },
            { token: UrlBuilder.REPO_TOKEN, value: UrlBuilder.GH_REPO, all: true },
            { token: UrlBuilder.BRANCH_TOKEN, value: UrlBuilder.GH_BRANCH, all: true }
        ];
        return TemplateUtil.replace(template, replacements);
    }

    public static getFileListUrl(): string {
        const template: string = UrlBuilder.URL_TEMPLATE_FILE_LIST;
        const replacements: Replacement[] = [
            { token: UrlBuilder.HOST_TOKEN, value: UrlBuilder.API_FETCH_BASE, all: true },
            { token: UrlBuilder.OWNER_TOKEN, value: UrlBuilder.GH_OWNER, all: true },
            { token: UrlBuilder.REPO_TOKEN, value: UrlBuilder.GH_REPO, all: true },
            { token: UrlBuilder.BRANCH_TOKEN, value: UrlBuilder.GH_BRANCH, all: true }
        ];
        return TemplateUtil.replace(template, replacements);
    }

    public static getFileContentsUrl(sha: string, file: string): string {
        const template: string = UrlBuilder.URL_TEMPLATE_FILE_CONTENTS;
        const replacements: Replacement[] = [
            { token: UrlBuilder.HOST_TOKEN, value: UrlBuilder.FILE_FETCH_BASE, all: true },
            { token: UrlBuilder.OWNER_TOKEN, value: UrlBuilder.GH_OWNER, all: true },
            { token: UrlBuilder.REPO_TOKEN, value: UrlBuilder.GH_REPO, all: true },
            { token: UrlBuilder.SHA_TOKEN, value: sha, all: true },
            { token: UrlBuilder.FILE_TOKEN, value: file, all: true }
        ];
        return TemplateUtil.replace(template, replacements);
    }

}

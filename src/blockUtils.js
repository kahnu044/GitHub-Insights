// blockUtils.js

console.log('Hello from  blockUtils.js');

export const GITHUB_API_URL = 'https://api.github.com/repos';

export const fetchGitHubRepoInfo = async (repoUrl) => {
    try {
        const response = await fetch(`${GITHUB_API_URL}${new URL(repoUrl).pathname}`);

        if (!response.ok) {

            if (response.status === 404) {

                return {
                    success: false,
                    message: 'Repository not found.',
                    data: [],
                };
            } else {
                return {
                    success: false,
                    message: 'An error occurred while fetching repository information.',
                    data: [],
                };
            }
        }

        const repoInfo = await response.json();

        // Create a new object with "user_" prefix for all keys in the owner object
        const modifiedOwnerInfo = {};
        for (const key in repoInfo.owner) {
            modifiedOwnerInfo[`user_${key}`] = repoInfo.owner[key];
        }

        // Create a new object by spreading the existing repoInfo and adding the modifiedOwnerInfo
        const modifiedRepoInfo = {
            ...repoInfo,
            ...modifiedOwnerInfo,
        };

        // Remove the owner key from the object
        delete modifiedRepoInfo.owner;

        return {
            success: true,
            message: 'Repo information fetched successfully',
            data: modifiedRepoInfo,
        };
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        return {
            success: false,
            message: 'There was a problem with the fetch operation',
            error: error?.message || 'An error occurred while fetching repository information',
        };
    }
};

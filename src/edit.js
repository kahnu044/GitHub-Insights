import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, FormTokenField, TextControl } from '@wordpress/components';

import './editor.scss';

const repoInfoField = [
	'name',
	'watchers_count',
	'language',
	'forks',
	'html_url',
	'url',
];

export default function Edit() {

	const [repoInfoLists, setRepoInfoLists] = useState([]);
	const [errorMessage, setErrorMessage] = useState('');
	const [githubRepoUrl, setGithubRepoUrl] = useState('');
	const [isValidGithubRepoUrl, setIsValidGithubRepoUrl] = useState(true);
	const [githubRepoErrorMessage, setGithubRepoErrorMessage] = useState('');
	const handleRepoListValue = (selectedListValues) => {

		// Check if every selected value is present in the repoInfoField array
		const isValidSelection = selectedListValues.every(value => repoInfoField.includes(value));
		setErrorMessage('');
		if (!isValidSelection) {
			setErrorMessage('Invalid entry. Please select a valid info name.');
			return;
		}
		setRepoInfoLists(selectedListValues);
	}

	// Check the github URL format and validate with github
	const validateGithubRepoUrl = async (url) => {

		setGithubRepoErrorMessage('')

		const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
		const isValidUrl = githubUrlPattern.test(url);
		if (!isValidUrl) {
			setIsValidGithubRepoUrl(false);
			setGithubRepoErrorMessage('Invalid GitHub URL')
			return;
		}

		setIsValidGithubRepoUrl(true)
		try {
			const response = await fetch(`https://api.github.com/repos${new URL(url).pathname}`);
			if (!response.ok) {

				setIsValidGithubRepoUrl(false);

				// Repository does not exist or private
				if (response.status === 404) {
					setGithubRepoErrorMessage('Repository not found.')
				} else {
					setGithubRepoErrorMessage('An error occurred while fetching repository information.')
				}
				return;
			}
		} catch (error) {
			setIsValidGithubRepoUrl(false);
			setGithubRepoErrorMessage('Error validating GitHub URL')
		}
	};

	return (
		<div {...useBlockProps()}>
			<InspectorControls>
				<PanelBody title="GitHub Repo Settings">

					<TextControl
						label="Enter GitHub Repo URL"
						value={githubRepoUrl}
						onChange={(value) => setGithubRepoUrl(value)}
						onBlur={() => validateGithubRepoUrl(githubRepoUrl)}
					/>
					{!isValidGithubRepoUrl && (
						<p style={{ color: 'red' }}>{githubRepoErrorMessage}</p>
					)}

					<FormTokenField
						label="Select Info Fields"
						value={repoInfoLists}
						suggestions={repoInfoField}
						onChange={(listValues) => handleRepoListValue(listValues)}
						placeholder="Select Fields Name"
					/>
					{errorMessage && (
						<p style={{ color: 'red', marginTop: '5px' }}>{errorMessage}</p>
					)}
				</PanelBody>
			</InspectorControls>
			<RichText
				tagName="p"
				// value={attributes.heading}
				// allowedFormats={['core/bold', 'core/italic']}
				// onChange={(heading) => setAttributes({ heading })}
				placeholder="Enter heading here..."
			/>
		</div>
	);
}

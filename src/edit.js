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

	// Check the github URL format
	const validateGithubRepoUrl = (url) => {

		const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
		const isValidUrl = githubUrlPattern.test(url);
		if (!isValidUrl) {
			setIsValidGithubRepoUrl(false);
			return;
		}
		setIsValidGithubRepoUrl(true)
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
						<p style={{ color: 'red', marginTop: '5px' }}>Invalid GitHub URL</p>
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

import { __ } from '@wordpress/i18n';
import { useState, useEffect } from 'react';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, FormTokenField, TextControl } from '@wordpress/components';
import { GITHUB_API_URL, fetchGitHubRepoInfo } from './blockUtils';
import './editor.scss';

export default function Edit({ attributes, setAttributes }) {

	const [repoInfoLists, setRepoInfoLists] = useState(attributes.selectedInfoNames || []);
	const [errorMessage, setErrorMessage] = useState('');
	const [githubRepoUrl, setGithubRepoUrl] = useState(attributes.githubRepoUrl || '');
	const [isValidGithubRepoUrl, setIsValidGithubRepoUrl] = useState(true);
	const [githubRepoErrorMessage, setGithubRepoErrorMessage] = useState('');
	const [matchedInfoValues, setMatchedInfoValues] = useState([]);
	const [repoSuggestionField, setRepoSuggestionField] = useState(attributes.githubRepoSuggestionsField || []);

	const handleRepoListValue = (selectedListValues) => {

		// Check if every selected value is present in the repoSuggestionField array
		const isValidSelection = selectedListValues.every(value => repoSuggestionField.includes(value));
		setErrorMessage('');
		if (!isValidSelection) {
			setErrorMessage('Invalid entry. Please select a valid info name.');
			return;
		}
		setRepoInfoLists(selectedListValues);
		setAttributes({ selectedInfoNames: selectedListValues });
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

			const responseData = await fetchGitHubRepoInfo(url);

			if (!responseData.success) {
				setGithubRepoErrorMessage(responseData.message);
				return;
			}

			const repoInfo = responseData.data;

			// Set the suggestion key name
			setRepoSuggestionField(Object.keys(repoInfo));

			setAttributes(
				{
					githubRepoUrl: url,
					isValidGithubUrl: isValidGithubRepoUrl,
					githubRepoResponseInfo: JSON.stringify(repoInfo),
					githubRepoSuggestionsField: Object.keys(repoInfo)
				});

		} catch (error) {
			setIsValidGithubRepoUrl(false);
			setGithubRepoErrorMessage('Error validating GitHub URL')
		}
	};

	const matchValuesWithPreferences = () => {
		const { githubRepoResponseInfo } = attributes;
		if (githubRepoResponseInfo) {
			const repoInfo = JSON.parse(githubRepoResponseInfo);
			const matched = repoInfoLists.map((key) => ({
				key,
				value: repoInfo[key],
			}));
			setMatchedInfoValues(matched);
		}
	};

	useEffect(() => {
		matchValuesWithPreferences();
	}, [repoInfoLists, attributes.githubRepoResponseInfo]);

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
					{githubRepoErrorMessage && (
						<p style={{ color: 'red' }}>{githubRepoErrorMessage}</p>
					)}

					<FormTokenField
						label="Select Info Fields"
						value={repoInfoLists}
						suggestions={repoSuggestionField}
						onChange={(listValues) => handleRepoListValue(listValues)}
						placeholder="Select Fields Name"
					/>
					{errorMessage && (
						<p style={{ color: 'red', marginTop: '5px' }}>{errorMessage}</p>
					)}
				</PanelBody>
			</InspectorControls>

			{matchedInfoValues && (
				<div style={{ padding: "10px" }}>
					<RichText
						tagName="h4"
						value={attributes.sectionHeading}
						style={{ margin: 0 }}
						onChange={(newValue) => setAttributes({ sectionHeading: newValue })}
					/>
					{matchedInfoValues.map(({ key, value }) => (
						<RichText key={key} tagName="p" value={`${key} : ${value}`} />
					))}
				</div>
			)}
		</div>
	);
}

import { __ } from '@wordpress/i18n';
import { useState, useEffect } from 'react';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, FormTokenField, TextControl } from '@wordpress/components';
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

			// Set the suggestion key name
			setRepoSuggestionField(Object.keys(modifiedRepoInfo));

			setAttributes(
				{
					githubRepoUrl: url,
					isValidGithubUrl: isValidGithubRepoUrl,
					githubRepoResponseInfo: JSON.stringify(modifiedRepoInfo),
					githubRepoSuggestionsField: Object.keys(modifiedRepoInfo)
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
					{!isValidGithubRepoUrl && (
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

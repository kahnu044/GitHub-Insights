import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {

	const { githubRepoUrl, isValidGithubUrl, githubRepoResponseInfo, selectedInfoNames, sectionHeading, lastUpdated } = attributes;

	const repoInfo = JSON.parse(githubRepoResponseInfo);

	// Filter out the selected info based on user preferences
	const filteredInfo = selectedInfoNames.map((name) => ({
		key: name,
		value: repoInfo[name],
	}));

	return (
		<>
			<div {...useBlockProps.save()} style={{ position: "relative" }}>
				<h4 style={{ margin: 5 }}>{sectionHeading}</h4>
				<ul style={{ marginTop: 0 }}>
					{filteredInfo.map(({ key, value }) => (
						<li key={key}>{`${key}: ${value}`}</li>
					))}
				</ul>

				<p>{`Last updated ${lastUpdated}`}</p>

				{isValidGithubUrl ? (
					<a href={githubRepoUrl}
						style={{ color: "#e3d5d552", position: "absolute", right: "10px", bottom: "10px" }}
						target="_blank"
						rel="noopener noreferrer">
						View on GitHub
					</a>
				) : (
					<p>Error: Invalid GitHub URL</p>
				)}
			</div>
		</>
	);
}

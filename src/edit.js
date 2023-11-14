import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, FormTokenField } from '@wordpress/components';

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

	return (
		<div {...useBlockProps()}>
			<InspectorControls>
				<PanelBody title="GitHub Repo Settings">
					<FormTokenField
						label="Select Info Fields"
						value={repoInfoLists}
						suggestions={repoInfoField}
						onChange={(tokens) => setRepoInfoLists(tokens)}
						placeholder="Select Fields Name"
					/>
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

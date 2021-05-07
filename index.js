import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';
import { execSync } from 'child_process';

export default function ({ minify = false } = {}) {
	const adapter = {
		name: 'adapter-firebase-function',

		async adapt(utils) {
			const files = fileURLToPath(new URL('./files', import.meta.url));
			if (!existsSync('firebase.json')) {
				utils.copy(join(files, '_firebase.json'), 'firebase.json');
				utils.log.success('Auto generated firebase.json')
			}

			const { hosting, functions } = read_config()

			const dirs = {
				hosting: hosting.public,
				functions: functions.source
			};

			// TODO ideally we'd have something like utils.tmpdir('vercel')
			// rather than hardcoding '.svelte-kit/vercel/entry.js', and the
			// relative import from that file to output/server/app.js
			// would be controlled. at the moment we're exposing
			// implementation details that could change
			utils.log.minor('Generating serverless function...');
			utils.copy(join(files, 'index.js'), '.svelte-kit/firebase-function/index.js');

			const outfile = join(dirs.functions, 'ssr.js') 
			utils.rimraf(outfile)
			await esbuild.build({
				entryPoints: ['.svelte-kit/firebase-function/index.js'],
				outfile,
				bundle: true,
				platform: 'node',
				target:['node12'],
				legalComments: 'none',
				minify
			});

			if (!existsSync(join(dirs.functions, 'index.js'))) {
				utils.log.minor('Generated required functions index.js file if doesn\'t exists')
				utils.copy(join(files, '_index.js'), join(dirs.functions, 'index.js'));
			}

			if (!existsSync(join(dirs.functions, 'package.json'))) {
				utils.log.minor('Generated required package.json file if doesn\'t exists')
				utils.copy(join(files, '_package.json'), join(dirs.functions, 'package.json'));
				utils.log.success('You need to run npm install on your function directory')
			}

			utils.rimraf(dirs.hosting)
			utils.log.minor('Prerendering static pages...');
			await utils.prerender({
				dest: dirs.hosting
			});

			utils.log.minor('Copying assets...');
			utils.copy_static_files(dirs.hosting);
			utils.copy_client_files(dirs.hosting);

		}
	};

	return adapter;
}

function read_config() {
	if (existsSync('firebase.json')) {
		let firebase_config
		try {
			firebase_config = JSON.parse(readFileSync('firebase.json','utf-8'))
		} catch (e) {
			e.message = 'Error parsing firebase.json file: ' + e.message
			throw e
		}

		return firebase_config
	} 

	throw new Error('No firebase.json file detected, create it or run firebase init')
}
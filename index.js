import { writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';
import { execSync } from 'child_process';

export default function () {
	const adapter = {
		name: 'adapter-firebase-function',

		async adapt(utils) {
			const dir = '.firebase';
			utils.rimraf(dir);

			const files = fileURLToPath(new URL('./files', import.meta.url));

			const dirs = {
				hosting: join(dir, 'hosting'),
				function: join(dir, 'function')
			};

			// TODO ideally we'd have something like utils.tmpdir('vercel')
			// rather than hardcoding '.svelte-kit/vercel/entry.js', and the
			// relative import from that file to output/server/app.js
			// would be controlled. at the moment we're exposing
			// implementation details that could change
			utils.log.minor('Generating serverless function...');
			utils.copy(`${files}/_package.json`, '.svelte-kit/firebase-function/package.json');
			utils.copy(join(files, 'index.js'), '.svelte-kit/firebase-function/index.js');

			const stdout = execSync('npm install', { cwd: '.svelte-kit/firebase-function' });
			utils.log.info(stdout.toString());

			await esbuild.build({
				entryPoints: ['.svelte-kit/firebase-function/index.js'],
				outfile: join(dirs.function, 'index.js'),
				bundle: true,
				platform: 'node',
				legalComments: 'none'
			});

			writeFileSync(join(dirs.function, 'package.json'), JSON.stringify({ main: 'index.js' }));

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

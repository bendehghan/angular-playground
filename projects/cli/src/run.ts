import * as getPort from "get-port";
import { configure, Config } from "./configure";
import { buildSandboxes } from "./build-sandboxes";
import { startWatch } from "./start-watch";
import { verifySandboxes } from "./check-errors/verify-sandboxes";
import { serveAngularCli } from "./serve-angular-cli";
import { buildAngularCli } from "./build-angular-cli";
import { checkSnapshots } from "./check-snapshots";

export async function run() {
    console.log(">>>>>6627");
    console.log(">>>>>process.argv:", process.argv);

    const config: Config = configure(process.argv);

    console.log(`>>>>>Running with config: ${JSON.stringify(config, null, 2)}`);
    try {
        await buildSandboxes(
            config.sourceRoots,
            config.chunk,
            config.verifySandboxes || config.checkVisualRegressions,
            config.definedSandboxesPath
        );
    } catch (err) {
        throw err;
    }

    console.log(">>>> build cli", config.build, config.buildWithServiceWorker);

    if (config.build || config.buildWithServiceWorker) {
        return await buildAngularCli(
            config.angularAppName,
            !!config.buildWithServiceWorker,
            config.baseHref,
            config.angularCliMaxBuffer
        );
    }

    console.log(">>>> get port", config.verifySandboxes);

    if (
        config.verifySandboxes ||
        (config.checkVisualRegressions && !config.deleteSnapshots)
    ) {
        config.angularCliPort = await getPort({ host: config.angularCliHost });
    }

    console.log(">>>> startWatch", config.watch, config.deleteSnapshots);
    if (
        (config.watch && !config.deleteSnapshots) ||
        config.verifySandboxes ||
        (config.checkVisualRegressions && !config.deleteSnapshots)
    ) {
        startWatch(config.sourceRoots, () =>
            buildSandboxes(
                config.sourceRoots,
                config.chunk,
                config.verifySandboxes || config.checkVisualRegressions,
                config.definedSandboxesPath
            )
        );
    }

    console.log(">>>> serveAngularCli", config.serve, config.deleteSnapshots);

    if (
        (config.serve && !config.deleteSnapshots) ||
        config.verifySandboxes ||
        (config.checkVisualRegressions && !config.deleteSnapshots)
    ) {
        try {
            await serveAngularCli(config);
        } catch (err) {
            throw err;
        }
    }

    console.log(">>>> verifySandboxes", config.verifySandboxes);

    if (config.verifySandboxes) {
        try {
            await verifySandboxes(config);
        } catch (err) {
            throw err;
        }
    }

    console.log("visual regressions", config.checkVisualRegressions);

    if (config.checkVisualRegressions) {
        try {
            await checkSnapshots(config);
        } catch (err) {
            throw err;
        }
    }
}

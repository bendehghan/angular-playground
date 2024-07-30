import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { SandboxesDefined } from "./sandboxes";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { PlaygroundModule } from "angular-playground";

platformBrowserDynamic()
  .bootstrapModule(
    PlaygroundModule.configure({
      selector: "app-root",
      overlay: true,
      modules: [BrowserAnimationsModule],
      sandboxesDefined: SandboxesDefined,
    })
  )
  .catch((err) => {
    console.error(err);
  });

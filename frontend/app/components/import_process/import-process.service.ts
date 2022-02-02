import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Step } from '../../models/enums.model';
import { Import } from '../../models/import.model';
import { ModuleConfig } from "../../module.config";

@Injectable()
export class ImportProcessService {
    private importData: Import | null = null;

	constructor(
		private router: Router,
		private route: ActivatedRoute) { }

  setImportData(importData: Import) {
    this.importData  = importData;
  }

  getImportData(): Import | null {
    return this.importData;
  }

  getLastAvailableStep(): Step {
    console.log(this.importData);
    let lastAvailableStep = Step.Import;
    if (!this.importData.full_file_name || !this.importData.detected_format || !this.importData.detected_encoding) {
      lastAvailableStep = Step.Upload;
    } else if (!this.importData.import_table) {
      lastAvailableStep = Step.Decode;
    } else if (!this.importData.id_field_mapping) {
      lastAvailableStep = Step.FieldMapping;
    } else if (!this.importData.id_content_mapping) {
      lastAvailableStep = Step.ContentMapping;
    }
    return lastAvailableStep;
  }

  resetImportData() {
    this.importData = null;
  }

  getRouterLinkForStep(step: Step) {
    console.log(step, "get router linl for step")
    if (this.importData == null) return null;
    let stepName = Step[step].toLowerCase();
    let importId: number = this.importData.id_import;
    return [ModuleConfig.MODULE_URL, 'process', importId, stepName];
  }

  navigateToStep(step: Step) {
    console.log(step, "navigateStep")
    this.router.navigate(this.getRouterLinkForStep(step));
  }

  // If some steps must be skipped, implement it here
  getPreviousStep(step: Step): Step {
    return step - 1;
  }

  // If some steps must be skipped, implement it here
  getNextStep(step: Step): Step {
    return step + 1;
  }

  navigateToPreviousStep(step: Step) {
    this.navigateToStep(this.getPreviousStep(step));
  }

  navigateToNextStep(step: Step) {
    this.navigateToStep(this.getNextStep(step));
  }

  navigateToLastStep() {
    this.navigateToStep(this.getLastAvailableStep());
  }

  beginProcess(datasetId: number) {
    const link = [ModuleConfig.MODULE_URL, 'process', Step[Step.Upload].toLowerCase()];
	   this.router.navigate(link, { queryParams: { datasetId: datasetId } });
  }

  continueProcess(importData: Import) {
    this.importData = importData;
    console.log("continue process")
    this.navigateToStep(this.getLastAvailableStep());
  }
}
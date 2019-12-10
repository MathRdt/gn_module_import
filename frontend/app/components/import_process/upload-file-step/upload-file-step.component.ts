import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { ToastrService } from 'ngx-toastr';
import { ModuleConfig } from '../../../module.config';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { StepsService, Step1Data, Step2Data } from '../steps.service';

@Component({
	selector: 'upload-file-step',
	styleUrls: [ 'upload-file-step.component.scss' ],
	templateUrl: 'upload-file-step.component.html'
})
export class UploadFileStepComponent implements OnInit {
	public fileName: string;
	public spinner: boolean = false;
	private skip: boolean = false;
	public uploadForm: FormGroup;
	public uploadFileErrors: any;
    public importConfig = ModuleConfig;
    public isUserErrors: boolean = false;
    public isFileChanged: boolean = false;
	stepData: Step1Data;

	importId: number;
	dataForm: any;
	datasetId: any;

	constructor(
		private _activatedRoute: ActivatedRoute,
		private _ds: DataService,
		private toastr: ToastrService,
		private _fb: FormBuilder,
		private stepService: StepsService,
		private _router: Router
	) {
		this.uploadForm = this._fb.group({
			file: [ null, Validators.required ],
			encodage: [ null, Validators.required ],
			srid: [ null, Validators.required ],
			separator: [ null, Validators.required ]
		});
	}

	ngOnInit() {
		this.datasetId =this._activatedRoute.snapshot.queryParams['datasetId'];
		this.stepData = this.stepService.getStepData(1);
		if (this.stepData) {
			this.importId = this.stepData.importId;
			this.dataForm = this.stepData.formData;
			this.datasetId = this.stepData.datasetId;
		}
		if (this.dataForm) {
			this.skip = true;
			this.fileName = this.dataForm.fileName;
			this.uploadForm.patchValue({
				file: this.fileName,
				encodage: this.dataForm.encoding,
				srid: this.dataForm.srid,
				separator: this.dataForm.separator,
			});
			this.formListener();
		}
        console.log('this.up', this.uploadForm);
        
        console.log(this.fileName);
        console.log(this.dataForm);
        console.log(this.stepData);
        console.log(this.importId);

        // disable 'separator' form control if geojson file provided :
        if (this.fileName) {
            this.disableSeparatorIfGeojson();
            /*
            this.uploadForm.controls['encodage'].disable();
            this.uploadForm.controls['srid'].disable();
            this.uploadForm.controls['separator'].disable();
            */
        }

        this.isUserErrors = false;
        this.uploadFileErrors = null;
        this.isFileChanged = false;
		
    }
    

    disableSeparatorIfGeojson() {
        let extension = this.fileName.split('.').pop();
        if (extension === 'geojson') {
            this.uploadForm.controls['separator'].disable();
        } else {
            this.uploadForm.controls['separator'].enable();
        }
    }


    isDisable() {
        if (this.uploadForm.invalid) {
            return true
        }
        if (this.isUserErrors) {
            return true
        }
        return false
    }


	onFileSelected(event: any) {
		this.uploadForm.patchValue({
			file: <File>event.target.files[0]
		});
		if (event.target.value.length == 0) {
			this.fileName = null;
		} else {
			this.fileName = event.target.files[0].name;
        }
        this.disableSeparatorIfGeojson();
        /*
        this.uploadForm.controls['encodage'].enable();
        this.uploadForm.controls['srid'].enable();
        this.uploadForm.controls['separator'].enable();
        */
        this.isFileChanged = true;
	}


	onFileClick(event) {
		event.target.value = '';
		this.fileName = null;
		this.skip = false;
		this.uploadForm.patchValue({
			file: null
        });
        this.isUserErrors = false;
        this.uploadFileErrors = null;
	}


	onUpload(formValues: any) {
        this.uploadFileErrors = null;
        this.isUserErrors = false;
		this.spinner = true;
		console.log('skip up', this.skip);
		
		if (!this.skip) {
			this._ds
                .postUserFile(formValues, this.datasetId , this.importId, this.isFileChanged, this.fileName)
				.subscribe(
					(res) => {
						this.importId = res.importId;
						let step2Data: Step2Data = {
							importId: res.importId,
							srid: formValues.srid
						};
						this.stepService.setStepData(2, step2Data);
						let step1data : Step1Data = {
							importId : res.importId,
							datasetId: this.datasetId,
							formData :{
								fileName: res['fileName'],
								srid : formValues.srid,
								separator: formValues.separator,
								encoding : formValues.encodage
							}
						}
						this.stepService.setStepData(1, step1data)
						this._router.navigate([ `${ModuleConfig.MODULE_URL}/process/step/2` ]);
						this.spinner = false;
					},
					(error) => {
						this.spinner = false;
						if (error.statusText === 'Unknown Error') {
							this.toastr.error('ERROR: IMPOSSIBLE TO CONNECT TO SERVER (check your connexion)');
						} else {
                            if (error.status == 400) {
                                this.isUserErrors = true;
                                this.uploadFileErrors = error.error;
                                console.log(this.uploadFileErrors);
                            } else {
                                this.toastr.error(error.error.message);
                            }
						}
					}
				);
		} else {
			this.spinner = false;
			this._router.navigate([ `${ModuleConfig.MODULE_URL}/process/step/2` ]);
		}
	}


	formListener() {
		this.uploadForm.valueChanges.subscribe(() => {
			if (this.uploadForm.valid) {
				this.skip = false;
				console.log('skip', this.skip);
			}
		});
	}
}

import {Component, OnInit, HostListener, Inject, InjectionToken, OnDestroy} from '@angular/core';
import { MdlDialogReference, MdlDialogService } from '@angular-mdl/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

import { Context } from '@models/context';
import { FormsService } from '@services/forms.service';
import { EndpointStore } from '@stores/endpoint.store';
import { ContextStore } from '@stores/context.store';
import { JobStore } from '@stores/job.store'
import { Endpoint } from '@models/endpoint';
import { MdlSnackbarService } from '@angular-mdl/core';
import { DialogAddContextComponent } from '@components/dialogs/dialog-add-context/dialog-add-context.component';
import { environment } from 'environments/environment';
import { Location } from '@angular/common';
import { AlertService } from '@services/alert.service';

export let injectableEndpoint = new InjectionToken<Endpoint>('selectedEndpoint');



@Component({
    selector: 'mist-dialog-add-endpoint',
    templateUrl: './dialog-endpoint-form.component.html',
    styleUrls: ['./dialog-endpoint-form.component.scss'],
    providers: [FormsService, MdlSnackbarService, AlertService]
})
export class DialogEndpointFormComponent implements OnInit, OnDestroy {
    public formTitle: string;
    public endpointNameReadOnly: boolean;
    public endpointForm: FormGroup;
    public contexts: Context[];
    public file: File;
    public formErrors = {
        name: '',
        path: '',
        className: '',
        context: ''
    };
    public loading: boolean;
    public isCreateContextFormVisiblie: boolean;
    public defaultContext: string;
    public selectedEndpoint: Endpoint;
    private data: Endpoint;
    private requestBody: string;
    private requestMethod: string;
    private port: string;
    private apiUrl: string;
    private endpointFormSub;
    private contextStoreSub;
    private endpointStoreSub;

    @HostListener('document:keydown.escape')
    public onEsc() {
        this.dialogRef.hide();
    }

    constructor(
        private fb: FormBuilder,
        public dialogRef: MdlDialogReference,
        private formsService: FormsService,
        private endpointStore: EndpointStore,
        private jobStore: JobStore,
        private mdlSnackbarService: MdlSnackbarService,
        private dialog: MdlDialogService,
        private contextStore: ContextStore,
        @Inject(injectableEndpoint) data: Endpoint,
        private location: Location,
        private alertService: AlertService
    ) {
        this.port = environment.production ? window.location.port : environment.port;
        const path = this.location.prepareExternalUrl(environment.apiUrl).replace("/ui" + environment.apiUrl, environment.apiUrl);
        this.apiUrl = `${window.location.protocol}//${window.location.hostname}:${this.port}${path}`;

        this.selectedEndpoint = data;
        if (!this.selectedEndpoint) {
            this.formTitle = 'Add Function';
            this.requestMethod = 'POST';
        } else {
            this.formTitle = 'Update Function';
            this.endpointNameReadOnly = true;
            this.requestMethod = 'PUT';
        }
    }

    ngOnInit() {
        this.createEndpointFrom();
        this.contextStore.getAll();
        this.contextStoreSub = this.contextStore.contexts.subscribe(data => { this.contexts = data });
        if (this.selectedEndpoint) {
            this.updateEndpointFormValues(this.selectedEndpoint);
        };
    }

    ngOnDestroy() {
        if (this.contextStoreSub) {
            this.contextStoreSub.unsubscribe();
        }
        if (this.endpointFormSub) {
            this.endpointFormSub.unsubscribe();
        }
        if (this.endpointFormSub) {
            this.endpointFormSub.unsubscribe();
        }
    }

    private updateEndpointFormValues(endpoint: Endpoint) {
        this.defaultContext = endpoint.defaultContext;
        this.endpointForm.setValue({
            name: endpoint.name,
            path: endpoint.path,
            defaultContext: endpoint.defaultContext,
            className: endpoint.className || '',
        });
    }

    createEndpointFrom() {
        const fs = this.formsService;
        this.endpointForm = this.fb.group({
            name: ['', [Validators.required]],
            path: ['', [Validators.required]],
            defaultContext: ['', [Validators.required]],
            className: ['', [Validators.required]],
        });

        this.endpointForm.valueChanges
            .subscribe( () => {
                fs.setErrors(this.endpointForm, this.formErrors, fs.MESSAGES.ERRORS.forms.addEndpoint);
            });

        fs.setErrors(this.endpointForm, this.formErrors, fs.MESSAGES.ERRORS.forms.addEndpoint);
    }

    submitEnpointForm(form) {
        let endpointRequestMethod;
        const self = this;
        const fs = this.formsService;
        let endpointMessage = 'has been successfully ';
        const _endpoint = new Endpoint({
            name: form.controls.name.value,
            path: form.controls.path.value,
            className: form.controls.className.value,
            defaultContext: form.controls.defaultContext.value,
            file: this.file
        });

        if (form.valid) {
            this.loading = true;
            if (!this.selectedEndpoint) {
                endpointRequestMethod = this.endpointStore.createEndpoint(_endpoint);
                endpointMessage += 'added';
            } else {
                endpointRequestMethod = this.endpointStore.updateEndpoint(_endpoint);
                endpointMessage += 'updated';
            }
            
            endpointRequestMethod
                .subscribe(
                    (endpoint) => {
                        self.loading = false;
                        this.dialogRef.hide();
                        this.mdlSnackbarService.showSnackbar({
                        message: `${endpoint.name} ${endpointMessage}`,
                        timeout: 5000
                        });
                    }, 
                    (error) => {
                        self.loading = false;
                        this.alertService.error(error);
                    }
                );

        } else {
            fs.setErrors(this.endpointForm, this.formErrors, fs.MESSAGES.ERRORS.forms.addEndpoint);
            return false;
        }
    }

    showDialogContext() {
        this.dialog.showCustomDialog({
            component: DialogAddContextComponent,
            styles: {'width': '850px'},
            isModal: true,
            clickOutsideToClose: true,
            enterTransitionDuration: 400,
            leaveTransitionDuration: 400,
        });
    }

    onFileChange($event) {
        this.file = $event.target.files[0];
    }

    copiedToClipBoardSuccessfully(inputTarget) {
        this.mdlSnackbarService.showSnackbar({
            message: `CURL params were copied out to clipboard successfully`,
            timeout: 5000
        });
    }

}

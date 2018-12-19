import React from "react";
import Form from "react-jsonschema-form";
import { IConnection } from "../../../../models/applicationState.js";
import LocalFolderPicker from "../../common/localFolderPicker";
// tslint:disable-next-line:no-var-requires
const formSchema = require("./connectionForm.json");
// tslint:disable-next-line:no-var-requires
const uiSchema = require("./connectionForm.ui.json");

export interface IConnectionFormProps extends React.Props<ConnectionForm> {
    connection: IConnection;
    onSubmit: (connection: IConnection) => void;
}

interface IConnectionFormState {
    formSchema: any;
    uiSchema: any;
    formData: IConnection;
}

export default class ConnectionForm extends React.Component<IConnectionFormProps, IConnectionFormState> {
    private widgets = {
        localFolderPicker: LocalFolderPicker,
    };

    constructor(props, context) {
        super(props, context);

        this.state = {
            formSchema: { ...formSchema },
            uiSchema: { ...uiSchema },
            formData: this.props.connection,
        };

        if (this.props.connection) {
            this.bindForm(this.props.connection);
        }

        this.onFormChange = this.onFormChange.bind(this);
    }

    public componentDidUpdate(prevProps) {
        if (prevProps.connection !== this.props.connection) {
            this.bindForm(this.props.connection);
        }
    }

    public render() {
        return (
            <div className="app-connections-page-detail m-3 text-light">
                <h3><i className="fas fa-plug fa-1x"></i><span className="px-2">Connection Settings</span></h3>
                <div className="m-3 text-light">
                    <Form
                        widgets={this.widgets}
                        schema={this.state.formSchema}
                        uiSchema={this.state.uiSchema}
                        formData={this.state.formData}
                        onChange={this.onFormChange}
                        onSubmit={(form) => this.props.onSubmit(form.formData)}>
                    </Form>
                </div>
            </div>

        );
    }

    private onFormChange = (args) => {
        const formData = this.state.formData;

        if (!formData || formData.providerType !== args.formData.providerType) {
            this.bindForm(args.formData, true);
        } else {
            this.setState({
                formSchema: args.schema,
                uiSchema: args.uiSchema,
                formData: args.formData,
            });
        }
    }

    private bindForm(connection: IConnection, resetProviderOptions: boolean = false) {
        const providerType = connection ? connection.providerType : null;
        let newFormSchema: any = this.state.formSchema;
        let newUiSchema: any = this.state.uiSchema;

        if (providerType) {
            const providerSchema = require(`../../../../providers/storage/${providerType}.json`);
            const providerUiSchema = require(`../../../../providers/storage/${providerType}.ui.json`);

            newFormSchema = { ...formSchema };
            newFormSchema.properties["providerOptions"] = providerSchema;

            newUiSchema = { ...uiSchema };
            newUiSchema["providerOptions"] = providerUiSchema;
        }

        const formData = { ...connection };
        if (resetProviderOptions) {
            formData.providerOptions = {};
        }

        this.setState({
            formSchema: newFormSchema,
            uiSchema: newUiSchema,
            formData,
        });
    }
}

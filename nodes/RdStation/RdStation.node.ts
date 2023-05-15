import { IExecuteFunctions } from 'n8n-core';

import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { OptionsWithUri } from 'request';

const eventTypeMap: any = {
	conversion: 'CONVERSION',
	opportunity: 'OPPORTUNITY',
	sale: 'SALE',
	lost: 'OPPORTUNITY_LOST',
};

export class RdStation implements INodeType {
	description: INodeTypeDescription = {
		// Basic node details will go here
		displayName: 'RD Station',
		name: 'rdStation',
		icon: 'file:rdStation.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume RD Station API',
		defaults: {
			name: 'RD Station',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'rdStationOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
			},
		],
		properties: [
			// Resources and operations will go here
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Conversion',
						value: 'conversion',
					},
					{
						name: 'Opportunity',
						value: 'opportunity',
					},
					{
						name: 'Sale',
						value: 'sale',
					},
					{
						name: 'Lost',
						value: 'lost',
					},
				],
				default: 'conversion',
				noDataExpression: true,
				required: true,
				description: 'Create a new conversion',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['conversion', 'opportunity', 'sale', 'lost'],
					},
				},
				options: [
					{
						name: 'New Conversion',
						value: 'new',
						description: 'Register a new conversion',
						action: 'Register a new conversion',
					},
				],
				default: 'new',
				noDataExpression: true,
			},
			{
				displayName: 'Identifier',
				name: 'identifier',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['new'],
						resource: ['conversion'],
					},
				},
				default: '',
				placeholder: 'new lead',
				description: 'Conversion Identifier',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['new'],
						resource: ['conversion', 'opportunity', 'sale', 'lost'],
					},
				},
				default: '',
				placeholder: 'name@email.com',
				description: 'Primary email for the lead',
			},
			{
				displayName: 'Funnel Name',
				name: 'funnel_name',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['new'],
						resource: ['opportunity', 'sale', 'lost'],
					},
				},
				default: '',
				placeholder: 'default',
				description:
					'Name of the funnel to which the Contact should be marked as opportunity, won or lost',
			},
			{
				displayName: 'Value',
				name: 'value',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['new'],
						resource: ['sale'],
					},
				},
				default: '',
				placeholder: 'Value',
				description: 'Value of the won opportunity',
			},
			{
				displayName: 'Reason',
				name: 'reason',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['new'],
						resource: ['lost'],
					},
				},
				default: '',
				placeholder: 'Reason',
				description: 'Reason for why the Contact was marked as lost',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['conversion'],
						operation: ['new'],
					},
				},
				options: [
					{
						displayName: 'Custom Fields',
						name: 'customFields',
						placeholder: 'Add Custom Fields',
						description: 'Adds a custom fields to set also values which have not been predefined',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						options: [
							{
								name: 'customFieldValues',
								displayName: 'Field',
								values: [
									{
										displayName: 'Field Name on RD Station',
										name: 'fieldId',
										type: 'string',
										default: '',
										description:
											'Custom field created in RDSM and its value related to the contact. All custom fields available in the RD Station account are valid in this payload. They must be sent with the prefix "cf_" plus the name of the field, for example: cf_idade You can find the identifier of fields already created or create new ones at <a href="https://app.rdstation.com.br/campos-personalizados">RD Station - Custom Fields</a>.',
									},
									{
										displayName: 'Field Value',
										name: 'fieldValue',
										type: 'string',
										default: '',
										description: 'Value of the field to set',
									},
								],
							},
						],
					},
				],
			},
		],
	};
	// The execute method will go here
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const credentials = (await this.getCredentials('rdStationOAuth2Api')) as {
			url: string;
			accessToken: string;
		};

		if (credentials === undefined) {
			throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
		}

		// Handle data coming from previous nodes
		const items = this.getInputData();
		let responseData;
		const returnData = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// For each item, make an API call to create a contact
		for (let i = 0; i < items.length; i++) {
			if (['conversion', 'opportunity', 'sale', 'lost'].includes(resource)) {
				if (operation === 'new') {
					// Get email input
					const email = this.getNodeParameter('email', i) as string;
					// Set the Payload
					const payload: IDataObject = {
						email: email,
					};
					if (resource === 'conversion') {
						// Get identifier input
						const identifier = this.getNodeParameter('identifier', i) as string;
						payload.conversion_identifier = identifier;

						// Get additional fields input
						const { customFields } = this.getNodeParameter('additionalFields', i) as {
							customFields: {
								customFieldValues: [
									{
										fieldId: string;
										fieldValue: string;
									},
								];
							};
						};
						if (customFields?.customFieldValues) {
							const { customFieldValues } = customFields;
							const data = customFieldValues.reduce(
								(obj, value) => Object.assign(obj, { [`${value.fieldId}`]: value.fieldValue }),
								{},
							);
							Object.assign(payload, data);
						}
					}
					if (['opportunity', 'sale', 'lost'].includes(resource)) {
						// Get funnel name input
						const funnelName = this.getNodeParameter('funnel_name', i) as string;
						payload.funnel_name = funnelName;
					}
					if (['sale'].includes(resource)) {
						// Get value input
						const value = this.getNodeParameter('value', i) as number;
						if (value) {
							payload.value = value;
						}
					}
					if (['lost'].includes(resource)) {
						// Get reason input
						const reason = this.getNodeParameter('reason', i) as string;
						if (reason) {
							payload.reason = reason;
						}
					}

					const options: OptionsWithUri = {
						headers: {
							Accept: 'application/json',
						},
						method: 'POST',
						body: {
							event_type: eventTypeMap[resource],
							event_family: 'CDP',
							payload,
						},
						uri: `https://api.rd.services/platform/events`,
						json: true,
					};
					responseData = await this.helpers.requestWithAuthentication.call(
						this,
						'rdStationOAuth2Api',
						options,
					);
					returnData.push(responseData);
				}
			}
		}
		// Map data to n8n data structure
		return [this.helpers.returnJsonArray(returnData)];
	}
}

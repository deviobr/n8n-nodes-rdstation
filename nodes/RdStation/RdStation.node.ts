import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { rdStationApiRequest } from './shared/transport';

const eventTypeMap: {[key: string]: string} = {
	conversion: 'CONVERSION',
	opportunity: 'OPPORTUNITY',
	sale: 'SALE',
	lost: 'OPPORTUNITY_LOST',
	call_finished: 'CALL_FINISHED',
};

export class RdStation implements INodeType {
	description: INodeTypeDescription = {
		// Basic node details will go here
		displayName: 'RD Station',
		name: 'rdStation',
		icon: { light: 'file:../../icons/rdStation.svg', dark: 'file:../../icons/rdStation.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume RD Station API',
		defaults: {
			name: 'RD Station',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'rdStationOAuth2Api',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.rd.services/platform',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			// Resources and operations will go here
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Call Finished',
						value: 'call_finished',
					},
					{
						name: 'Conversion',
						value: 'conversion',
					},
					{
						name: 'Lost',
						value: 'lost',
					},
					{
						name: 'Opportunity',
						value: 'opportunity',
					},
					{
						name: 'Sale',
						value: 'sale',
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
						resource: ['conversion', 'opportunity', 'sale', 'lost', 'call_finished'],
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
			  displayName: 'Telefone (Celular)',
			  name: 'mobile_phone',
			  type: 'string',
			  default: '',
			  placeholder: '+55 48 99999-9999',
			  description: 'Número de celular do lead',
			  displayOptions: {
				show: {
				  resource: ['conversion'],
				  operation: ['new'],
				},
			  },
			},
			{
			  displayName: 'Nome',
			  name: 'name',
			  type: 'string',
			  default: '',
			  placeholder: 'Fulano de Tal',
			  description: 'Nome completo do lead',
			  displayOptions: {
				show: {
				  resource: ['conversion'],
				  operation: ['new'],
				},
			  },
			},
			{
			  displayName: 'Cargo',
			  name: 'job_title',
			  type: 'string',
			  default: '',
			  placeholder: 'Desenvolvedor',
			  description: 'Cargo ou posição do lead',
			  displayOptions: {
				show: {
				  resource: ['conversion'],
				  operation: ['new'],
				},
			  },
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['new'],
						resource: ['conversion', 'opportunity', 'sale', 'lost', 'call_finished'],
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
				displayName: 'Call From Number',
				name: 'call_from_number',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['new'],
						resource: ['call_finished'],
					},
				},
				default: '',
				placeholder: 'Call From Number',
				description: 'Number of Call Tracking',
			},
			{
				displayName: 'Call Type',
				name: 'call_type',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['new'],
						resource: ['call_finished'],
					},
				},
				options: [
					{
						name: 'Inbound',
						value: 'Inbound',
					},
					{
						name: 'Outbound',
						value: 'Outbound',
					},
				],
				default: 'Outbound',
				placeholder: 'Call Status',
				description: 'Call type. Inbound or Outbound.',
			},
			{
				displayName: 'Call Status',
				name: 'call_status',
				type: 'hidden',
				default: 'in_progress',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['conversion', 'call_finished'],
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
		// Handle data coming from previous nodes
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		let responseData;

		// For each item, make an API call to create a contact
		for (let i = 0; i < items.length; i++) {
			try {
				if (['conversion', 'opportunity', 'sale', 'lost', 'call_finished'].includes(resource)) {
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
							const mobilePhone = this.getNodeParameter('mobile_phone', i) as string;
							if (mobilePhone) {
							  payload.mobile_phone = mobilePhone;
							}

							const fullName = this.getNodeParameter('name', i) as string;
							if (fullName) {
							  payload.name = fullName;
							}

							const jobTitle = this.getNodeParameter('job_title', i) as string;
							if (jobTitle) {
							  payload.job_title = jobTitle;
							}
						} else if (['opportunity', 'sale', 'lost'].includes(resource)) {
							// Get funnel name input
							const funnelName = this.getNodeParameter('funnel_name', i) as string;
							payload.funnel_name = funnelName;

							if (resource === 'sale') {
								// Get value input
								const value = this.getNodeParameter('value', i) as number;
								if (!isNaN(value)) {
									payload.value = +value;
								}
							} else if (resource === 'lost') {
								// Get reason input
								const reason = this.getNodeParameter('reason', i) as string;
								if (reason) {
									payload.reason = reason;
								}
							}
						} else if (resource === 'call_finished') {
							// Get call from number input
							const callFromNumber = this.getNodeParameter('call_from_number', i) as string;
							payload.call_from_number = callFromNumber;

							// Get call type input
							const callType = this.getNodeParameter('call_type', i) as string;
							payload.call_type = callType;

							// Get call status input
							const callStatus = this.getNodeParameter('call_status', i) as string;
							payload.call_status = callStatus;
						}

						if (['conversion', 'call_finished'].includes(resource)) {
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

						const body: IDataObject = {
							event_type: eventTypeMap[resource],
							event_family: 'CDP',
							payload,
						};
						responseData = await rdStationApiRequest.call(this, 'POST', '/events', body);
					}
				}
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: this.getInputData(i)[0].json, error, pairedItem: i });
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
						error.context.itemIndex = i;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex: i,
					});
				}
			}
		}

		return [returnData];
	}
}

import type { Icon, ICredentialType, INodeProperties } from 'n8n-workflow';

export class RdStationOAuth2Api implements ICredentialType {
	name = 'rdStationOAuth2Api';
	extends = ['oAuth2Api'];
	displayName = 'RD Station OAuth2 API';
	icon: Icon = { light: 'file:../icons/rdStation.svg', dark: 'file:../icons/rdStation.dark.svg' };
	documentationUrl = 'https://developers.rdstation.com/reference/introducao-rdsm';
	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: 'https://api.rd.services/auth/dialog',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://api.rd.services/auth/token',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'body',
		},
	];
}

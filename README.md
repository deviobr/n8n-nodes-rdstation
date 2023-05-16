# n8n-nodes-rdstation

![RD Station Marketing](https://avatars.githubusercontent.com/u/817058?s=200&v=4)
![n8n.io - Workflow Automation](https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png)

This is an n8n community node. It lets you use RD Station Marketing Conversion API in your n8n workflows.

RD Station Marketing is an all-in-one Digital Marketing automation tool. This means that it brings together the main resources to carry out a Digital Marketing strategy in one place, and you can carry out different actions in a single software, with more efficiency and productivity.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Resources](#resources)
[Version history](#version-history)
[License](#license)

## Installation

### Community Nodes (Recommended)

For users on n8n v0.187+, your instance owner can install this node from [Community Nodes](https://docs.n8n.io/integrations/community-nodes/installation/).

1. Go to **Settings > Community Nodes**.
2. Select **Install**.
3. Enter `@deviobr/n8n-nodes-rdstation` in **Enter npm package name**.
4. Agree to the [risks](https://docs.n8n.io/integrations/community-nodes/risks/) of using community nodes: select **I understand the risks of installing unverified code from a public source**.
5. Select **Install**.

After installing the node, you can use it like any other node. n8n displays the node in search results in the **Nodes** panel.

## Operations

- All Operations
  - **New Conversion**: Allows you to record a conversion event in RD Station Marketing. [Reference](https://developers.rdstation.com/reference/eventos-padr%C3%A3o).

## Credentials

Step by step for configuration

1. Access the RD Station Marketing [App Store](https://appstore.rdstation.com/en/publisher);
2. Log in to the management page and click **I want to create an app**;
3. In the popup, fill the fields and click **Create App**;
4. Copy the 'OAuth Callback URL' provided in the RD Station OAuth2 API credentials in n8n and paste it in the Callback URLs field in the RD Station APP Store app creation page;
5. Fill in any other necessary information and click on the **Save and advance** button;
6. Use the 'Client ID' and the 'Client Secret' displayed with your RD Station OAuth2 API credentials in n8n;
7. Click on the circle button in the OAuth section to connect a RD Station account to n8n;
8. Click the Save button to save your credentials;

## Compatibility

n8n v0.187+.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [RD Station Marketing API Key Authentication](https://developers.rdstation.com/reference/autenticacao-api-key)
- [RD Station Marketing API Key Conversion](https://developers.rdstation.com/reference/conversao)

## Version history

0.2.0

## License

MIT License

Copyright (c) 2023 Devio <hey@devio.com.br>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

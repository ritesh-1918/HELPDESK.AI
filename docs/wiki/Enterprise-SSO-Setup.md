# Enterprise SSO Integration & Setup Guide

This guide walks through configuring Single Sign-On (SSO) and Directory Synchronization for HelpDesk.AI using SAML 2.0 and OAuth 2.0.

---

## 1. Okta SAML 2.0 Configuration

### Step 1: Create a SAML Application in Okta
1. Log in to the **Okta Admin Console**.
2. Navigate to **Applications** > **Applications** > **Create App Integration**.
3. Select **SAML 2.0** and click **Next**.
4. Set the **App name** to `HelpDesk.AI` and click **Next**.

### Step 2: Configure SAML Settings
1. **Single sign-on URL**: `http://localhost:8000/auth/sso/saml/callback`
2. Select `Use this for Recipient URL and Destination URL`.
3. **Audience URI (SP Entity ID)**: `https://helpdesk.ai`
4. **Name ID format**: `EmailAddress`
5. **Application username**: `Email`

### Step 3: Configure Attribute Statements
Add the following attribute mappings:
- `email` (Value: `user.email`)
- `first_name` (Value: `user.firstName`)
- `last_name` (Value: `user.lastName`)

### Step 4: Configure Group Attribute Claims (Optional)
To sync employee roles based on Okta groups:
- **Name**: `groups`
- **Filter**: `Matches regex` | `.*` (or filter specifically for groups starting with `HelpDesk_`)

### Step 5: Save & Import Metadata
1. Complete the setup wizard in Okta.
2. In the **Sign On** tab, click **View SAML setup instructions** or **Identity Provider metadata** link.
3. Copy the XML content or download the file, and upload it to the **HelpDesk.AI Administration Settings Dashboard**.

---

## 2. Microsoft Azure AD (Entra ID) SAML Configuration

### Step 1: Create a Enterprise Application
1. Log in to the **Microsoft Entra admin center**.
2. Navigate to **Identity** > **Applications** > **Enterprise applications** > **New application**.
3. Click **Create your own application**, enter `HelpDesk.AI`, select **Integrate any other application you don't find in the gallery (Non-gallery)**, and click **Create**.

### Step 2: Configure SAML Single Sign-On
1. On the application overview page, click **Single sign-on** > **SAML**.
2. In **Basic SAML Configuration** click Edit:
   - **Identifier (Entity ID)**: `https://helpdesk.ai`
   - **Reply URL (Assertion Consumer Service URL)**: `http://localhost:8000/auth/sso/saml/callback`
3. In **Attributes & Claims**, configure:
   - Unique User Identifier: `user.mail`
   - Add a group claim to map Azure AD groups: Click **Add a group claim**, select **Security groups** or **All groups**, and set **Source attribute** to `Group ID` or `Cloud-only group display names`.

### Step 3: Download Metadata XML
1. Scroll down to **SAML Certificates** section.
2. Download **Federation Metadata XML**.
3. Upload this XML file to **HelpDesk.AI Admin SSO Config**.

---

## 3. Google Workspace SAML Configuration

### Step 1: Add Custom SAML App
1. Log in to the **Google Admin Console** with administrator privileges.
2. Navigate to **Apps** > **Web and mobile apps** > **Add App** > **Add custom SAML app**.
3. Enter `HelpDesk.AI` as App name, and click **Continue**.
4. Copy the **SSO URL**, **Entity ID**, and download the **Certificate**, then click **Continue**.

### Step 2: Configure Service Provider Details
1. **ACS URL**: `http://localhost:8000/auth/sso/saml/callback`
2. **Entity ID**: `https://helpdesk.ai`
3. **Name ID format**: `EMAIL`
4. **Name ID**: `Basic Information > Primary email`
5. Click **Continue**.

### Step 3: Attribute Mapping
Configure the following attributes:
- App Attribute: `email` ➔ Primary email
- App Attribute: `first_name` ➔ First name
- App Attribute: `last_name` ➔ Last name
- App Attribute: `groups` ➔ Department / Groups

Click **Finish**. Turn the app **ON for everyone** or specific organizational units.

---

## 4. Directory Sync (SCIM Webhook) Setup
HelpDesk.AI supports automated provisioning & de-provisioning via webhooks.
1. Copy the webhook URL from **JIT Provisioning tab**: `http://localhost:8000/api/sso/webhook`
2. Copy the **Secret Token** header.
3. Configure this in your IdP's Provisioning settings to automate account creations and suspensions.

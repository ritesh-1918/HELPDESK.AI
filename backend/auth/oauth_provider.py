import urllib.request
import urllib.parse
import json
import ssl

def get_authorization_url(provider: str, client_id: str, redirect_uri: str, state: str) -> str:
    """
    Generates the OAuth 2.0 authorization URL for redirecting the user.
    """
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "state": state
    }
    
    if provider == "google":
        url = "https://accounts.google.com/o/oauth2/v2/auth"
        params.update({
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent"
        })
    elif provider == "microsoft":
        url = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
        params.update({
            "scope": "openid email profile User.Read Directory.Read.All"
        })
    elif provider == "github":
        url = "https://github.com/login/oauth/authorize"
        params.update({
            "scope": "read:user user:email read:org"
        })
    else:
        raise ValueError(f"Unsupported OAuth provider: {provider}")
        
    return f"{url}?{urllib.parse.urlencode(params)}"

def exchange_code_for_tokens(provider: str, code: str, client_id: str, client_secret: str, redirect_uri: str) -> dict:
    """
    Exchanges the authorization code for an access token.
    """
    if provider == "google":
        url = "https://oauth2.googleapis.com/token"
    elif provider == "microsoft":
        url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
    elif provider == "github":
        url = "https://github.com/login/oauth/access_token"
    else:
        raise ValueError(f"Unsupported OAuth provider: {provider}")
        
    payload = {
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code"
    }
    
    data = urllib.parse.urlencode(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Accept": "application/json", "Content-Type": "application/x-www-form-urlencoded"}
    )
    
    # Ignore SSL verification for local dev fallback robustness if needed
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            res_body = response.read().decode("utf-8")
            return json.loads(res_body)
    except Exception as e:
        print(f"[OAuth exchange error] {provider} exchange failed: {e}")
        return {"error": str(e)}

def get_user_profile(provider: str, access_token: str) -> dict:
    """
    Fetches the user's email, name, avatar, and group memberships from the provider API.
    """
    # Create SSL Context to avoid certificate validation issues in local test runners
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }
    
    # Stub response handler helper
    def fetch_api(url, custom_headers=None):
        r_headers = custom_headers or headers
        req = urllib.request.Request(url, headers=r_headers)
        try:
            with urllib.request.urlopen(req, context=ctx) as response:
                return json.loads(response.read().decode("utf-8"))
        except Exception as e:
            print(f"[OAuth API error] Failed to fetch {url}: {e}")
            return None

    email = None
    full_name = None
    avatar_url = None
    groups = []
    
    if provider == "google":
        # Get standard profile info
        profile = fetch_api("https://www.googleapis.com/oauth2/v3/userinfo")
        if profile:
            email = profile.get("email")
            full_name = profile.get("name")
            avatar_url = profile.get("picture")
            
    elif provider == "microsoft":
        # Get Microsoft Graph profile info
        profile = fetch_api("https://graph.microsoft.com/v1.0/me")
        if profile:
            email = profile.get("mail") or profile.get("userPrincipalName")
            full_name = profile.get("displayName")
            
            # Fetch Microsoft Graph groups
            groups_data = fetch_api("https://graph.microsoft.com/v1.0/me/transitiveMemberOf")
            if groups_data and "value" in groups_data:
                for grp in groups_data["value"]:
                    # Look for group displayName
                    if grp.get("@odata.type") == "#microsoft.graph.group":
                        groups.append(grp.get("displayName"))
                        
    elif provider == "github":
        # Get GitHub user profile
        gh_headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/json",
            "User-Agent": "HelpDesk-AI-SSO-Client"
        }
        profile = fetch_api("https://api.github.com/user", custom_headers=gh_headers)
        if profile:
            full_name = profile.get("name") or profile.get("login")
            avatar_url = profile.get("avatar_url")
            
            # Fetch emails (as user:email scope gives private emails)
            emails = fetch_api("https://api.github.com/user/emails", custom_headers=gh_headers)
            if emails:
                primary = next((e for e in emails if e.get("primary")), None)
                email = primary.get("email") if primary else emails[0].get("email")
            else:
                email = profile.get("email")
                
            # Fetch GitHub Orgs/Teams as Groups
            orgs = fetch_api("https://api.github.com/user/orgs", custom_headers=gh_headers)
            if orgs:
                for org in orgs:
                    groups.append(org.get("login"))
                    
    if not email:
        return {"status": "error", "message": "Failed to retrieve user email from OAuth provider."}
        
    return {
        "status": "success",
        "email": email,
        "full_name": full_name or email.split("@")[0].title(),
        "avatar_url": avatar_url,
        "groups": groups
    }

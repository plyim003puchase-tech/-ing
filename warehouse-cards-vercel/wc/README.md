# Warehouse cards (Vercel)

Open the link, drop the Goods Received Note (.xlsx), get the Word file. Photos come from your two Drive folders, saved in `api/_drive.js`.
Anyone with the link can use it; there is no login.

## One-time setup

### 1. Google service account (a robot login for Drive)
1. Go to https://console.cloud.google.com and create a project (any name).
2. Open "APIs & Services" > "Library", search "Google Drive API", click Enable.
3. Open "IAM & Admin" > "Service Accounts" > Create service account (any name) > Done.
4. Click the new account > "Keys" > Add key > Create new key > JSON. A .json file downloads. Keep it private.
5. Copy the service account's email (looks like name@project.iam.gserviceaccount.com).
6. In Google Drive, right-click each of your two photo folders > Share > paste that email > Viewer > Send.

### 2. Put the code on GitHub
1. Create a free account at https://github.com and make a new repository (Private is fine).
2. Upload everything in this folder (api, public, package.json, vercel.json). Upload the folders' contents, not the zip file itself.

### 3. Deploy on Vercel
1. Sign up free at https://vercel.com with your GitHub account (Hobby plan).
2. Add New > Project > pick the repository > before clicking Deploy, open "Environment Variables".
3. Add: Name = GOOGLE_SERVICE_ACCOUNT_JSON, Value = the full text of the .json key file (open it in Notepad, copy everything).
4. Deploy. Your link will be https://<project-name>.vercel.app

### Changing folders later
Add an environment variable FOLDER_IDS (folder IDs separated by commas) in Vercel > Settings > Environment Variables, then redeploy. Remember to share the new folder with the service account email.

### If it fails
- "Could not read the Drive folders": the JSON key is missing/incomplete in Vercel, or the folders are not shared with the service account email.
- Photos missing: the photo file name must be the product code (e.g. SN-05014.jpg).

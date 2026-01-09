# 🔓 How to Unlock & Edit Locked Environment Variables in Coolify

## 🚨 Problem: Can't Edit Locked Variables

If you've locked your environment variables and now can't edit them (even clicking the lock icon doesn't work), here are several solutions:

---

## ✅ Solution 1: Click on the Variable Name (Not the Lock Icon)

**This is the most common solution:**

1. **Don't click the lock icon** - it might not be interactive
2. **Click directly on the variable name** or the variable row itself
3. This should open an edit dialog/modal
4. In the edit dialog, you should see:
   - The current value
   - An option to unlock/edit
   - Fields to update the value
5. **Edit the value** to your new domain
6. **Click "Update"** or "Save"
7. The variable will remain locked after update (if it was locked before)

---

## ✅ Solution 2: Use "Developer View" Button

1. Look for the **"Developer view"** button at the top right of the Environment Variables page
2. Click it to toggle developer mode
3. This might reveal additional options or make variables editable
4. Try editing the variable again

---

## ✅ Solution 3: Delete and Recreate (If Safe)

**⚠️ WARNING: Only do this if you have the current values backed up!**

1. **First, note down the current value** of the variable you want to edit
2. Click the **red "Delete"** button next to the variable
3. Confirm the deletion
4. Click **"+ Add"** button to create a new variable
5. Enter:
   - **Name:** Same as before (e.g., `FRONTEND_URL`)
   - **Value:** Your new domain value
   - **Available at Buildtime:** ✅ Checked (if needed)
   - **Available at Runtime:** ✅ Checked
6. Click **"Add"** or **"Save"**
7. Lock it again if desired

---

## ✅ Solution 4: Try Right-Click or Context Menu

1. **Right-click** on the variable row
2. Look for options like:
   - "Edit"
   - "Unlock"
   - "Modify"
3. Select the appropriate option

---

## ✅ Solution 5: Check Browser Console for Errors

1. Open browser **Developer Tools** (F12 or Cmd+Option+I)
2. Go to **Console** tab
3. Try clicking the lock icon or variable name
4. Check for any JavaScript errors
5. If there are errors, try:
   - Refreshing the page
   - Clearing browser cache
   - Using a different browser

---

## ✅ Solution 6: Use Coolify API (Advanced)

If you have API access:

1. Get your Coolify API token from Settings
2. Use the API to update variables:

```bash
# Example (adjust URL and token)
curl -X PUT "https://your-coolify-instance.com/api/v1/projects/{project_id}/services/{service_id}/environment-variables/{var_id}" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "FRONTEND_URL",
    "value": "https://yourdomain.com",
    "is_build_time": true,
    "is_runtime": true
  }'
```

---

## 🎯 Quick Steps to Update to Your Domain

Once you can edit the variables, update these to your domain:

### Variables to Update:

1. **FRONTEND_URL**
   - Old: `http://31.97.57.75:3000`
   - New: `https://yourdomain.com` (or `https://www.yourdomain.com`)

2. **NEXT_PUBLIC_API_BASE_URL**
   - Old: `http://31.97.57.75:3001/api`
   - New: `https://api.yourdomain.com/api` (or `https://yourdomain.com/api`)

3. **NEXTAUTH_URL**
   - Old: `http://31.97.57.75:3000`
   - New: `https://yourdomain.com` (must match FRONTEND_URL)

### After Updating:

1. ✅ **Save all changes**
2. ✅ **Trigger a new deployment** (Redeploy button)
3. ✅ **Watch build logs** to ensure build succeeds
4. ✅ **Test your domain** - make sure it works

---

## 🔍 Troubleshooting

### If Nothing Works:

1. **Check Coolify Version:**
   - Some versions have bugs with locked variables
   - Try updating Coolify if possible

2. **Contact Coolify Support:**
   - This might be a platform bug
   - Report the issue with screenshots

3. **Temporary Workaround:**
   - Export all variables (if export feature exists)
   - Delete the service/resource
   - Recreate it
   - Import variables with new values
   - ⚠️ This is drastic - only as last resort

---

## 📝 Example: Updating FRONTEND_URL

**Step-by-step:**

1. Go to Coolify → Your Project → Environment Variables
2. Find `FRONTEND_URL` in the list
3. **Click on the variable name** (not the lock icon)
4. In the edit dialog:
   - Change value from: `http://31.97.57.75:3000`
   - To: `https://juellehair.com` (your domain)
   - Keep "Available at Buildtime" ✅ checked
   - Keep "Available at Runtime" ✅ checked
5. Click **"Update"**
6. Repeat for other URL variables
7. Go to **Deployments** tab
8. Click **"Redeploy"**
9. Wait for deployment to complete

---

## ✅ Success Checklist

After updating to your domain:

- [ ] All URL variables updated to your domain
- [ ] Variables still locked (if desired)
- [ ] New deployment triggered
- [ ] Build completed successfully
- [ ] Website accessible at your domain
- [ ] API calls working from frontend
- [ ] Authentication working (NextAuth)

---

**Last Updated:** January 8, 2026

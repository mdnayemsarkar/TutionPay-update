package com.ns.tuitioncollection;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import com.google.android.gms.auth.GoogleAuthUtil;
import com.google.android.gms.auth.UserRecoverableAuthException;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.tasks.Task;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends Activity {

    /*
     * ============================================================
     * REQUEST CODES
     * ============================================================
     */

    private static final int RC_SIGN_IN = 1001;

    /*
     * Drive permission/authorization-এর জন্য আলাদা request code।
     *
     * আগে RC_SIGN_IN একই সঙ্গে Sign-In এবং Drive authorization
     * result-এর জন্য ব্যবহার হচ্ছিল।
     */
    private static final int RC_DRIVE_AUTH = 1002;


    /*
     * ============================================================
     * GOOGLE DRIVE SCOPE
     * ============================================================
     */

    private static final String DRIVE_SCOPE =
            "https://www.googleapis.com/auth/drive.file";


    /*
     * ============================================================
     * WEBVIEW
     * ============================================================
     */

    private WebView webView;


    /*
     * ============================================================
     * GOOGLE SIGN IN
     * ============================================================
     */

    private GoogleSignInClient googleSignInClient;


    /*
     * ============================================================
     * DRIVE BACKGROUND EXECUTOR
     * ============================================================
     */

    private final ExecutorService driveExecutor =
            Executors.newSingleThreadExecutor();


    /*
     * ============================================================
     * MAIN THREAD HANDLER
     * ============================================================
     */

    private final Handler mainHandler =
            new Handler(Looper.getMainLooper());


    /*
     * ============================================================
     * ON CREATE
     * ============================================================
     */

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);


        /*
         * ========================================================
         * WEBVIEW CREATE
         * ========================================================
         */

        webView = new WebView(this);


        WebSettings settings =
                webView.getSettings();


        settings.setJavaScriptEnabled(true);

        settings.setDomStorageEnabled(true);

        settings.setAllowFileAccess(true);

        settings.setAllowContentAccess(true);

        settings.setAllowFileAccessFromFileURLs(true);

        settings.setAllowUniversalAccessFromFileURLs(true);


        /*
         * ========================================================
         * WEBVIEW CLIENT
         * ========================================================
         */

        webView.setWebViewClient(
                new WebViewClient() {

                    @Override
                    public void onPageFinished(
                            WebView view,
                            String url) {

                        super.onPageFinished(
                                view,
                                url
                        );
                    }


                    @Override
                    public void onReceivedError(
                            WebView view,
                            WebResourceRequest request,
                            WebResourceError error) {

                        super.onReceivedError(
                                view,
                                request,
                                error
                        );


                        if (request != null &&
                                request.isForMainFrame()) {

                            String message =
                                    "WEBVIEW ERROR\n\n" +
                                    "URL:\n" +
                                    request.getUrl() +
                                    "\n\nERROR:\n" +
                                    error.getDescription();


                            showErrorPage(message);
                        }
                    }
                }
        );


        /*
         * ========================================================
         * WEB CHROME CLIENT
         * ========================================================
         */

        webView.setWebChromeClient(
                new WebChromeClient() {

                    @Override
                    public boolean onConsoleMessage(
                            ConsoleMessage consoleMessage) {


                        if (consoleMessage != null &&
                                consoleMessage.messageLevel()
                                        == ConsoleMessage.MessageLevel.ERROR) {


                            String message =
                                    "JavaScript Error\n\n" +
                                    "Message:\n" +
                                    consoleMessage.message() +
                                    "\n\nLine:\n" +
                                    consoleMessage.lineNumber() +
                                    "\n\nSource:\n" +
                                    consoleMessage.sourceId();


                            /*
                             * Console error-এর কারণে
                             * পুরো app blank/error page করার বদলে
                             * log দেখানো হবে।
                             */
                            android.util.Log.e(
                                    "TuitionCollection",
                                    message
                            );
                        }


                        return true;
                    }
                }
        );


        /*
         * ========================================================
         * GOOGLE SIGN-IN OPTIONS
         * ========================================================
         */

        GoogleSignInOptions gso =
                new GoogleSignInOptions.Builder(
                        GoogleSignInOptions.DEFAULT_SIGN_IN
                )

                /*
                 * User email দরকার।
                 */
                .requestEmail()

                /*
                 * Google Drive permission।
                 */
                .requestScopes(
                        new Scope(DRIVE_SCOPE)
                )

                .build();


        /*
         * ========================================================
         * GOOGLE SIGN-IN CLIENT
         * ========================================================
         */

        googleSignInClient =
                GoogleSignIn.getClient(
                        this,
                        gso
                );


        /*
         * ========================================================
         * JAVASCRIPT BRIDGES
         * ========================================================
         */

        webView.addJavascriptInterface(
                new GoogleBridge(),
                "AndroidGoogle"
        );


        webView.addJavascriptInterface(
                new PrintBridge(),
                "AndroidPrint"
        );


        /*
         * ========================================================
         * LOAD APP
         * ========================================================
         */

        webView.loadUrl(
                "file:///android_asset/index.html"
        );


        setContentView(webView);
    }


    /*
     * ============================================================
     * ERROR PAGE
     * ============================================================
     */

    private void showErrorPage(
            final String message) {


        runOnUiThread(
                new Runnable() {

                    @Override
                    public void run() {


                        if (webView == null) {
                            return;
                        }


                        String safeMessage =
                                message
                                        .replace(
                                                "&",
                                                "&amp;"
                                        )
                                        .replace(
                                                "<",
                                                "&lt;"
                                        )
                                        .replace(
                                                ">",
                                                "&gt;"
                                        )
                                        .replace(
                                                "\"",
                                                "&quot;"
                                        );


                        String errorHtml =
                                "<!DOCTYPE html>" +

                                "<html><head>" +

                                "<meta charset='UTF-8'>" +

                                "<meta name='viewport' content='width=device-width,initial-scale=1'>" +

                                "<style>" +

                                "body{" +
                                "margin:0;" +
                                "padding:20px;" +
                                "background:#f5f5f5;" +
                                "font-family:Arial,sans-serif;" +
                                "}" +

                                ".box{" +
                                "background:white;" +
                                "border-radius:14px;" +
                                "padding:20px;" +
                                "box-shadow:0 4px 15px rgba(0,0,0,.12);" +
                                "}" +

                                "h2{" +
                                "color:#d32f2f;" +
                                "margin-top:0;" +
                                "}" +

                                "pre{" +
                                "white-space:pre-wrap;" +
                                "word-break:break-word;" +
                                "background:#111;" +
                                "color:#fff;" +
                                "padding:15px;" +
                                "border-radius:10px;" +
                                "font-size:14px;" +
                                "overflow:auto;" +
                                "}" +

                                "button{" +
                                "width:100%;" +
                                "padding:14px;" +
                                "margin-top:15px;" +
                                "border:0;" +
                                "border-radius:10px;" +
                                "background:#1976d2;" +
                                "color:white;" +
                                "font-size:16px;" +
                                "}" +

                                "</style></head><body>" +

                                "<div class='box'>" +

                                "<h2>⚠️ App Error</h2>" +

                                "<p>" +
                                "Tuition Fee Collection অ্যাপের WebView-তে একটি error পাওয়া গেছে।" +
                                "</p>" +

                                "<pre>" +
                                safeMessage +
                                "</pre>" +

                                "<button onclick='copyError()'>" +
                                "📋 Copy Error" +
                                "</button>" +

                                "</div>" +

                                "<script>" +

                                "function copyError(){" +

                                "var text=document.querySelector('pre').innerText;" +

                                "if(navigator.clipboard){" +

                                "navigator.clipboard.writeText(text)" +

                                ".then(function(){" +
                                "alert('Error copied');" +
                                "});" +

                                "}else{" +

                                "alert('Copy not supported');" +

                                "}" +

                                "}" +

                                "</script>" +

                                "</body></html>";


                        webView.loadDataWithBaseURL(
                                "file:///android_asset/",
                                errorHtml,
                                "text/html",
                                "UTF-8",
                                null
                        );
                    }
                }
        );
    }


    /*
     * ============================================================
     * GOOGLE BRIDGE
     * ============================================================
     */

    public class GoogleBridge {


        /*
         * ========================================================
         * SIGN IN
         * ========================================================
         *
         * গুরুত্বপূর্ণ:
         *
         * Sign-In শুরু করার আগে পুরোনো Google session signOut করা
         * হচ্ছে।
         *
         * এতে একই ফোনে User A থেকে User B account select করা
         * অনেক বেশি নির্ভরযোগ্য হবে।
         * ========================================================
         */

        @JavascriptInterface
        public void signIn() {


            runOnUiThread(
                    new Runnable() {

                        @Override
                        public void run() {


                            if (googleSignInClient == null) {

                                sendToWeb(
                                        "googleSignInFailed(" +
                                        jsString(
                                                "Google Sign-In client পাওয়া যায়নি।"
                                        ) +
                                        ")"
                                );

                                return;
                            }


                            /*
                             * আগে পুরোনো Google session পরিষ্কার।
                             */
                            googleSignInClient
                                    .signOut()
                                    .addOnCompleteListener(
                                            MainActivity.this,
                                            task -> {


                                                try {


                                                    Intent signInIntent =
                                                            googleSignInClient
                                                                    .getSignInIntent();


                                                    startActivityForResult(
                                                            signInIntent,
                                                            RC_SIGN_IN
                                                    );


                                                } catch (Exception e) {


                                                    sendToWeb(
                                                            "googleSignInFailed(" +
                                                            jsString(
                                                                    safeErrorMessage(e)
                                                            ) +
                                                            ")"
                                                    );
                                                }
                                            }
                                    );
                        }
                    }
            );
        }


        /*
         * ========================================================
         * CHECK SIGNED IN
         * ========================================================
         */

        @JavascriptInterface
        public boolean isSignedIn() {


            GoogleSignInAccount account =
                    GoogleSignIn.getLastSignedInAccount(
                            MainActivity.this
                    );


            return account != null;
        }


        /*
         * ========================================================
         * GET ACCOUNT EMAIL
         * ========================================================
         */

        @JavascriptInterface
        public String getAccountEmail() {


            GoogleSignInAccount account =
                    GoogleSignIn.getLastSignedInAccount(
                            MainActivity.this
                    );


            if (account != null &&
                    account.getEmail() != null) {


                return account.getEmail();
            }


            return "";
        }


        /*
         * ========================================================
         * SIGN OUT
         * ========================================================
         * 
         * WebView-কে signOut callback কেবল তখনই পাঠানো হবে
         * যখন Google signOut task complete হবে।
         * ========================================================
         */

        @JavascriptInterface
        public void signOut() {


            runOnUiThread(
                    new Runnable() {

                        @Override
                        public void run() {


                            if (googleSignInClient == null) {

                                sendToWeb(
                                        "googleSignedOut()"
                                );

                                return;
                            }


                            googleSignInClient
                                    .signOut()
                                    .addOnCompleteListener(
                                            MainActivity.this,
                                            task -> {


                                                sendToWeb(
                                                        "googleSignedOut()"
                                                );
                                            }
                                    );
                        }
                    }
            );
        }


        /*
         * ========================================================
         * BACKUP TO GOOGLE DRIVE
         * ========================================================
         */

        @JavascriptInterface
        public void backupToDrive(
                final String json) {


            /*
             * Empty / invalid backup আটকানো।
             */
            if (!isValidBackupJson(json)) {


                sendToWeb(
                        "googleDriveBackupFailed(" +
                        jsString(
                                "Backup করার মতো valid data পাওয়া যায়নি।"
                        ) +
                        ")"
                );


                return;
            }


            /*
             * Student / payment / batch data না থাকলে
             * empty backup upload হবে না।
             */
            if (!hasBackupData(json)) {


                sendToWeb(
                        "googleDriveBackupFailed(" +
                        jsString(
                                "বর্তমানে Student/Payment/Batch data নেই। Empty backup তৈরি করা হয়নি।"
                        ) +
                        ")"
                );


                return;
            }


            /*
             * Account check।
             */
            if (!isSignedIn()) {


                sendToWeb(
                        "googleDriveBackupFailed(" +
                        jsString(
                                "Google Account আগে Sign In করুন।"
                        ) +
                        ")"
                );


                return;
            }


            /*
             * Drive background thread।
             */
            driveExecutor.execute(
                    new Runnable() {

                        @Override
                        public void run() {


                            try {


                                String token =
                                        getDriveAccessToken();


                                if (token == null ||
                                        token.length() == 0) {


                                    throw new Exception(
                                            "Google Drive access token পাওয়া যায়নি।"
                                    );
                                }


                                String fileId =
                                        uploadBackupToDrive(
                                                token,
                                                json
                                        );


                                sendToWeb(
                                        "googleDriveBackupSuccess(" +
                                        jsString(fileId) +
                                        ")"
                                );


                            } catch (
                                    UserRecoverableAuthException e) {


                                handleRecoverableAuth(e);


                            } catch (Exception e) {


                                sendToWeb(
                                        "googleDriveBackupFailed(" +
                                        jsString(
                                                safeErrorMessage(e)
                                        ) +
                                        ")"
                                );
                            }
                        }
                    }
            );
        }


        /*
         * ========================================================
         * RESTORE FROM DRIVE
         * ========================================================
         */

        @JavascriptInterface
        public void restoreFromDrive() {


            if (!isSignedIn()) {


                sendToWeb(
                        "googleDriveRestoreFailed(" +
                        jsString(
                                "Google Account আগে Sign In করুন।"
                        ) +
                        ")"
                );


                return;
            }


            driveExecutor.execute(
                    new Runnable() {

                        @Override
                        public void run() {


                            try {


                                String token =
                                        getDriveAccessToken();


                                if (token == null ||
                                        token.length() == 0) {


                                    throw new Exception(
                                            "Google Drive access token পাওয়া যায়নি।"
                                    );
                                }


                                String json =
                                        downloadLatestValidBackup(
                                                token
                                        );


                                if (json == null ||
                                        json.trim().length() == 0) {


                                    throw new Exception(
                                            "Google Drive-এ কোনো valid Tuition backup পাওয়া যায়নি।"
                                    );
                                }


                                sendToWeb(
                                        "googleDriveRestoreSuccess(" +
                                        jsString(json) +
                                        ")"
                                );


                            } catch (
                                    UserRecoverableAuthException e) {


                                handleRecoverableAuth(e);


                            } catch (Exception e) {


                                sendToWeb(
                                        "googleDriveRestoreFailed(" +
                                        jsString(
                                                safeErrorMessage(e)
                                        ) +
                                        ")"
                                );
                            }
                        }
                    }
            );
        }
    }


    /*
     * ============================================================
     * GET DRIVE ACCESS TOKEN
     * ============================================================
     */

    private String getDriveAccessToken()
            throws Exception {


        GoogleSignInAccount account =
                GoogleSignIn.getLastSignedInAccount(
                        MainActivity.this
                );


        if (account == null) {


            throw new Exception(
                    "Google Account signed in নেই।"
            );
        }


        if (account.getAccount() == null) {


            throw new Exception(
                    "Google Account object পাওয়া যায়নি।"
            );
        }


        String scope =
                "oauth2:" + DRIVE_SCOPE;


        return GoogleAuthUtil.getToken(
                MainActivity.this,
                account.getAccount(),
                scope
        );
    }


    /*
     * ============================================================
     * RECOVERABLE DRIVE AUTH
     * ============================================================
     */

    private void handleRecoverableAuth(
            final UserRecoverableAuthException e) {


        runOnUiThread(
                new Runnable() {

                    @Override
                    public void run() {


                        try {


                            startActivityForResult(
                                    e.getIntent(),
                                    RC_DRIVE_AUTH
                            );


                        } catch (Exception ex) {


                            sendToWeb(
                                    "googleDriveBackupFailed(" +
                                    jsString(
                                            safeErrorMessage(ex)
                                    ) +
                                    ")"
                            );
                        }
                    }
                }
        );
    }


    /*
     * ============================================================
     * UPLOAD BACKUP
     * ============================================================
     */

    private String uploadBackupToDrive(
            String accessToken,
            String json)
            throws Exception {


        if (!isValidBackupJson(json)) {


            throw new Exception(
                    "Invalid backup JSON."
            );
        }


        if (!hasBackupData(json)) {


            throw new Exception(
                    "Empty backup upload blocked."
            );
        }


        String boundary =
                "----TuitionFeeBoundary" +
                System.currentTimeMillis();


        String fileName =
                "tuition_fee_collection_backup_" +
                System.currentTimeMillis() +
                ".json";


        String metadata =
                "{"
                + "\"name\":\""
                + escapeJson(fileName)
                + "\","
                + "\"mimeType\":\"application/json\""
                + "}";


        byte[] jsonBytes =
                json.getBytes(
                        StandardCharsets.UTF_8
                );


        String metadataPart =
                "--" +
                boundary +
                "\r\n" +

                "Content-Type: application/json; charset=UTF-8\r\n" +

                "\r\n" +

                metadata +

                "\r\n";


        String mediaPartHeader =
                "--" +
                boundary +
                "\r\n" +

                "Content-Type: application/json\r\n" +

                "\r\n";


        String closing =
                "\r\n" +

                "--" +
                boundary +
                "--\r\n";


        ByteArrayOutputStream body =
                new ByteArrayOutputStream();


        body.write(
                metadataPart.getBytes(
                        StandardCharsets.UTF_8
                )
        );


        body.write(
                mediaPartHeader.getBytes(
                        StandardCharsets.UTF_8
                )
        );


        body.write(jsonBytes);


        body.write(
                closing.getBytes(
                        StandardCharsets.UTF_8
                )
        );


        byte[] requestBody =
                body.toByteArray();


        URL url =
                new URL(
                        "https://www.googleapis.com/upload/drive/v3/files" +
                        "?uploadType=multipart"
                );


        HttpURLConnection connection =
                (HttpURLConnection)
                        url.openConnection();


        connection.setRequestMethod("POST");

        connection.setDoOutput(true);

        connection.setConnectTimeout(30000);

        connection.setReadTimeout(60000);


        connection.setRequestProperty(
                "Authorization",
                "Bearer " + accessToken
        );


        connection.setRequestProperty(
                "Content-Type",
                "multipart/related; boundary=" +
                boundary
        );


        connection.setRequestProperty(
                "Content-Length",
                String.valueOf(
                        requestBody.length
                )
        );


        OutputStream output =
                connection.getOutputStream();


        output.write(requestBody);

        output.flush();

        output.close();


        int responseCode =
                connection.getResponseCode();


        String response =
                readConnectionResponse(
                        connection,
                        responseCode
                );


        connection.disconnect();


        if (responseCode < 200 ||
                responseCode >= 300) {


            throw new Exception(
                    "Drive upload failed (" +
                    responseCode +
                    "): " +
                    response
            );
        }


        JSONObject result =
                new JSONObject(response);


        return result.optString(
                "id",
                ""
        );
    }


    /*
     * ============================================================
     * FIND NEWEST VALID BACKUP
     * ============================================================
     */

    private String downloadLatestValidBackup(
            String accessToken)
            throws Exception {


        String query =
                "name contains 'tuition_fee_collection_backup_'" +
                " and trashed = false";


        String encodedQuery =
                java.net.URLEncoder.encode(
                        query,
                        "UTF-8"
                );


        String urlString =
                "https://www.googleapis.com/drive/v3/files" +

                "?q=" +
                encodedQuery +

                "&orderBy=modifiedTime%20desc" +

                "&pageSize=100" +

                "&fields=files(id,name,mimeType,modifiedTime)";


        URL url =
                new URL(urlString);


        HttpURLConnection connection =
                (HttpURLConnection)
                        url.openConnection();


        connection.setRequestMethod("GET");

        connection.setConnectTimeout(30000);

        connection.setReadTimeout(60000);


        connection.setRequestProperty(
                "Authorization",
                "Bearer " + accessToken
        );


        int responseCode =
                connection.getResponseCode();


        String response =
                readConnectionResponse(
                        connection,
                        responseCode
                );


        connection.disconnect();


        if (responseCode < 200 ||
                responseCode >= 300) {


            throw new Exception(
                    "Drive list failed (" +
                    responseCode +
                    "): " +
                    response
            );
        }


        JSONObject result =
                new JSONObject(response);


        JSONArray files =
                result.optJSONArray("files");


        if (files == null ||
                files.length() == 0) {


            throw new Exception(
                    "Google Drive-এ কোনো Tuition backup পাওয়া যায়নি।"
            );
        }


        Exception lastError = null;


        for (int i = 0;
             i < files.length();
             i++) {


            try {


                JSONObject file =
                        files.getJSONObject(i);


                String fileId =
                        file.optString(
                                "id",
                                ""
                        );


                if (fileId.length() == 0) {
                    continue;
                }


                String json =
                        downloadDriveFile(
                                accessToken,
                                fileId
                        );


                if (!isValidBackupJson(json)) {
                    continue;
                }


                if (!hasBackupData(json)) {
                    continue;
                }


                return json;


            } catch (Exception e) {


                lastError = e;
            }
        }


        if (lastError != null) {


            throw new Exception(
                    "কোনো valid backup পাওয়া যায়নি। সর্বশেষ error: " +
                    safeErrorMessage(lastError)
            );
        }


        throw new Exception(
                "Google Drive-এ কোনো valid non-empty Tuition backup পাওয়া যায়নি।"
        );
    }


    /*
     * ============================================================
     * BACKUP JSON VALIDATION
     * ============================================================
     */

    private boolean isValidBackupJson(
            String json) {


        if (json == null ||
                json.trim().length() == 0) {


            return false;
        }


        try {


            JSONObject root =
                    new JSONObject(json);


            boolean hasStudents =
                    root.has("students") &&
                    root.opt("students")
                            instanceof JSONArray;


            boolean hasPayments =
                    root.has("payments") &&
                    root.opt("payments")
                            instanceof JSONArray;


            boolean hasBatches =
                    root.has("batches") &&
                    root.opt("batches")
                            instanceof JSONArray;


            if (hasStudents ||
                    hasPayments ||
                    hasBatches) {


                return true;
            }


            if (root.has("db") &&
                    root.opt("db")
                            instanceof JSONObject) {


                JSONObject db =
                        root.optJSONObject("db");


                if (db == null) {
                    return false;
                }


                boolean dbStudents =
                        db.has("students") &&
                        db.opt("students")
                                instanceof JSONArray;


                boolean dbPayments =
                        db.has("payments") &&
                        db.opt("payments")
                                instanceof JSONArray;


                boolean dbBatches =
                        db.has("batches") &&
                        db.opt("batches")
                                instanceof JSONArray;


                return dbStudents ||
                        dbPayments ||
                        dbBatches;
            }


            return false;


        } catch (Exception e) {


            return false;
        }
    }


    /*
     * ============================================================
     * CHECK BACKUP DATA
     * ============================================================
     */

    private boolean hasBackupData(
            String json) {


        if (json == null ||
                json.trim().length() == 0) {


            return false;
        }


        try {


            JSONObject root =
                    new JSONObject(json);


            JSONObject dataRoot =
                    root;


            if (root.has("db") &&
                    root.opt("db")
                            instanceof JSONObject) {


                JSONObject db =
                        root.optJSONObject("db");


                if (db != null) {
                    dataRoot = db;
                }
            }


            JSONArray students =
                    dataRoot.optJSONArray(
                            "students"
                    );


            JSONArray payments =
                    dataRoot.optJSONArray(
                            "payments"
                    );


            JSONArray batches =
                    dataRoot.optJSONArray(
                            "batches"
                    );


            int studentCount =
                    students == null
                            ? 0
                            : students.length();


            int paymentCount =
                    payments == null
                            ? 0
                            : payments.length();


            int batchCount =
                    batches == null
                            ? 0
                            : batches.length();


            return studentCount > 0 ||
                    paymentCount > 0 ||
                    batchCount > 0;


        } catch (Exception e) {


            return false;
        }
    }


    /*
     * ============================================================
     * DOWNLOAD SINGLE DRIVE FILE
     * ============================================================
     */

    private String downloadDriveFile(
            String accessToken,
            String fileId)
            throws Exception {


        URL url =
                new URL(
                        "https://www.googleapis.com/drive/v3/files/" +
                        fileId +
                        "?alt=media"
                );


        HttpURLConnection connection =
                (HttpURLConnection)
                        url.openConnection();


        connection.setRequestMethod("GET");

        connection.setConnectTimeout(30000);

        connection.setReadTimeout(60000);


        connection.setRequestProperty(
                "Authorization",
                "Bearer " + accessToken
        );


        int responseCode =
                connection.getResponseCode();


        if (responseCode < 200 ||
                responseCode >= 300) {


            String error =
                    readConnectionResponse(
                            connection,
                            responseCode
                    );


            connection.disconnect();


            throw new Exception(
                    "Drive download failed (" +
                    responseCode +
                    "): " +
                    error
            );
        }


        InputStream input =
                new BufferedInputStream(
                        connection.getInputStream()
                );


        ByteArrayOutputStream output =
                new ByteArrayOutputStream();


        byte[] buffer =
                new byte[8192];


        int count;


        while (
                (count = input.read(buffer))
                        != -1) {


            output.write(
                    buffer,
                    0,
                    count
            );
        }


        input.close();

        connection.disconnect();


        return output.toString(
                StandardCharsets.UTF_8.name()
        );
    }


    /*
     * ============================================================
     * READ HTTP RESPONSE
     * ============================================================
     */

    private String readConnectionResponse(
            HttpURLConnection connection,
            int responseCode)
            throws Exception {


        InputStream stream;


        if (responseCode >= 200 &&
                responseCode < 400) {


            stream =
                    connection.getInputStream();


        } else {


            stream =
                    connection.getErrorStream();


            if (stream == null) {
                return "Unknown HTTP error";
            }
        }


        BufferedReader reader =
                new BufferedReader(
                        new InputStreamReader(
                                stream,
                                StandardCharsets.UTF_8
                        )
                );


        StringBuilder result =
                new StringBuilder();


        String line;


        while (
                (line = reader.readLine())
                        != null) {


            result.append(line);
        }


        reader.close();


        return result.toString();
    }


    /*
     * ============================================================
     * SAFE ERROR MESSAGE
     * ============================================================
     */

    private String safeErrorMessage(
            Exception e) {


        if (e == null) {
            return "Unknown error";
        }


        String message =
                e.getMessage();


        if (message == null ||
                message.trim().length() == 0) {


            return e.getClass()
                    .getSimpleName();
        }


        return message;
    }


    /*
     * ============================================================
     * GOOGLE SIGN-IN ERROR DESCRIPTION
     * ============================================================
     */

    private String getGoogleSignInErrorMessage(
            ApiException e) {


        if (e == null) {
            return "Unknown Google Sign-In error";
        }


        int code =
                e.getStatusCode();


        String statusMessage =
                "";


        try {


            Status status =
                    e.getStatus();


            if (status != null &&
                    status.getStatusMessage() != null) {


                statusMessage =
                        status.getStatusMessage();
            }


        } catch (Exception ignored) {
        }


        String readable;


        switch (code) {


            case 4:

                readable =
                        "SIGN_IN_REQUIRED / Sign-In বাতিল বা প্রয়োজনীয় authorization পাওয়া যায়নি।";

                break;


            case 10:

                readable =
                        "DEVELOPER_ERROR / Google OAuth configuration বা SHA-1 configuration সমস্যা।";

                break;


            case 12500:

                readable =
                        "SIGN_IN_FAILED / Google Sign-In ব্যর্থ হয়েছে।";

                break;


            case 12501:

                readable =
                        "SIGN_IN_CANCELLED / User Sign-In বাতিল করেছেন।";

                break;


            case 12502:

                readable =
                        "SIGN_IN_CURRENTLY_IN_PROGRESS / অন্য একটি Sign-In ইতিমধ্যে চলছে।";

                break;


            default:

                readable =
                        "Google Sign-In ব্যর্থ হয়েছে।";
        }


        if (statusMessage != null &&
                statusMessage.length() > 0) {


            return readable +
                    "\nStatus Code: " +
                    code +
                    "\nGoogle Message: " +
                    statusMessage;
        }


        return readable +
                "\nStatus Code: " +
                code;
    }


    /*
     * ============================================================
     * JSON ESCAPE
     * ============================================================
     */

    private String escapeJson(
            String value) {


        if (value == null) {
            return "";
        }


        return value
                .replace(
                        "\\",
                        "\\\\"
                )
                .replace(
                        "\"",
                        "\\\""
                )
                .replace(
                        "\n",
                        "\\n"
                )
                .replace(
                        "\r",
                        "\\r"
                );
    }


    /*
     * ============================================================
     * PRINT BRIDGE
     * ============================================================
     */

    public class PrintBridge {


        @JavascriptInterface
        public void printReceipt(
                final String html) {


            runOnUiThread(
                    new Runnable() {

                        @Override
                        public void run() {


                            try {


                                final WebView printWebView =
                                        new WebView(
                                                MainActivity.this
                                        );


                                WebSettings settings =
                                        printWebView
                                                .getSettings();


                                settings.setJavaScriptEnabled(
                                        true
                                );


                                settings.setDomStorageEnabled(
                                        true
                                );


                                printWebView.setWebViewClient(
                                        new WebViewClient() {

                                            @Override
                                            public void onPageFinished(
                                                    WebView view,
                                                    String url) {


                                                PrintManager printManager =
                                                        (PrintManager)
                                                                getSystemService(
                                                                        PRINT_SERVICE
                                                                );


                                                if (printManager ==
                                                        null) {


                                                    Toast.makeText(
                                                            MainActivity.this,
                                                            "Print System পাওয়া যায়নি",
                                                            Toast.LENGTH_SHORT
                                                    ).show();


                                                    return;
                                                }


                                                PrintDocumentAdapter adapter =
                                                        printWebView
                                                                .createPrintDocumentAdapter(
                                                                        "Tuition Receipt"
                                                                );


                                                PrintAttributes attributes =
                                                        new PrintAttributes.Builder()
                                                                .setMediaSize(
                                                                        PrintAttributes.MediaSize.ISO_A4
                                                                )
                                                                .setMinMargins(
                                                                        PrintAttributes.Margins.NO_MARGINS
                                                                )
                                                                .build();


                                                printManager.print(
                                                        "Tuition Receipt",
                                                        adapter,
                                                        attributes
                                                );
                                            }
                                        }
                                );


                                String page =
                                        "<!DOCTYPE html>" +

                                        "<html><head>" +

                                        "<meta charset='UTF-8'>" +

                                        "<meta name='viewport' " +
                                        "content='width=device-width,initial-scale=1'>" +

                                        "</head><body " +
                                        "style='margin:0;padding:0;'>" +

                                        html +

                                        "</body></html>";


                                printWebView.loadDataWithBaseURL(
                                        "file:///android_asset/",
                                        page,
                                        "text/html",
                                        "UTF-8",
                                        null
                                );


                            } catch (Exception e) {


                                Toast.makeText(
                                        MainActivity.this,
                                        "Print Error: " +
                                        e.getMessage(),
                                        Toast.LENGTH_LONG
                                ).show();
                            }
                        }
                    }
            );
        }
    }


    /*
     * ============================================================
     * ACTIVITY RESULT
     * ============================================================
     */

    @Override
    protected void onActivityResult(
            int requestCode,
            int resultCode,
            Intent data) {


        super.onActivityResult(
                requestCode,
                resultCode,
                data
        );


        /*
         * ========================================================
         * NORMAL GOOGLE SIGN-IN RESULT
         * ========================================================
         */

        if (requestCode == RC_SIGN_IN) {


            Task<GoogleSignInAccount> task;


            try {


                task =
                        GoogleSignIn
                                .getSignedInAccountFromIntent(
                                        data
                                );


            } catch (Exception e) {


                sendToWeb(
                        "googleSignInFailed(" +
                        jsString(
                                safeErrorMessage(e)
                        ) +
                        ")"
                );


                return;
            }


            try {


                GoogleSignInAccount account =
                        task.getResult(
                                ApiException.class
                        );


                if (account == null) {


                    throw new Exception(
                            "Google Account পাওয়া যায়নি।"
                    );
                }


                String email =
                        account.getEmail();


                if (email == null) {
                    email = "";
                }


                /*
                 * Successful Sign-In.
                 */
                sendToWeb(
                        "googleSignedIn(" +
                        jsString(email) +
                        ")"
                );


                Toast.makeText(
                        MainActivity.this,
                        "Google Account connected\n" +
                        email,
                        Toast.LENGTH_SHORT
                ).show();


            } catch (ApiException e) {


                String error =
                        getGoogleSignInErrorMessage(e);


                sendToWeb(
                        "googleSignInFailed(" +
                        jsString(error) +
                        ")"
                );


                Toast.makeText(
                        MainActivity.this,
                        error,
                        Toast.LENGTH_LONG
                ).show();


                android.util.Log.e(
                        "TuitionCollection",
                        "Google Sign-In Error: " +
                        error
                );


            } catch (Exception e) {


                String error =
                        safeErrorMessage(e);


                sendToWeb(
                        "googleSignInFailed(" +
                        jsString(error) +
                        ")"
                );


                Toast.makeText(
                        MainActivity.this,
                        error,
                        Toast.LENGTH_LONG
                ).show();
            }


            return;
        }


        /*
         * ========================================================
         * DRIVE AUTHORIZATION RESULT
         * ========================================================
         *
         * Drive permission dialog থেকে ফিরে এলে এখানে আসবে।
         *
         * এটাকে normal Google Sign-In result হিসেবে process করা হবে না।
         * ========================================================
         */

        if (requestCode == RC_DRIVE_AUTH) {


            if (resultCode == RESULT_OK) {


                /*
                 * Authorization সফল হয়েছে।
                 *
                 * পরবর্তী Backup/Restore action আবার token নেবে।
                 */
                sendToWeb(
                        "googleDriveAuthorizationSuccess()"
                );


            } else {


                sendToWeb(
                        "googleDriveBackupFailed(" +
                        jsString(
                                "Google Drive permission দেওয়া হয়নি।"
                        ) +
                        ")"
                );
            }


            return;
        }
    }


    /*
     * ============================================================
     * SEND JAVASCRIPT TO WEBVIEW
     * ============================================================
     */

    private void sendToWeb(
            final String javascript) {


        runOnUiThread(
                new Runnable() {

                    @Override
                    public void run() {


                        if (webView != null) {


                            webView.evaluateJavascript(
                                    javascript,
                                    null
                            );
                        }
                    }
                }
        );
    }


    /*
     * ============================================================
     * JAVASCRIPT STRING
     * ============================================================
     */

    private String jsString(
            String value) {


        if (value == null) {
            return "\"\"";
        }


        return "\"" +
                value
                        .replace(
                                "\\",
                                "\\\\"
                        )
                        .replace(
                                "\"",
                                "\\\""
                        )
                        .replace(
                                "\n",
                                "\\n"
                        )
                        .replace(
                                "\r",
                                "\\r"
                        )
                        .replace(
                                "\u2028",
                                "\\u2028"
                        )
                        .replace(
                                "\u2029",
                                "\\u2029"
                        )
                + "\"";
    }


    /*
     * ============================================================
     * ANDROID BACK BUTTON
     * ============================================================
     */

    @Override
    public void onBackPressed() {


        if (webView == null) {


            super.onBackPressed();


            return;
        }


        webView.evaluateJavascript(
                "(function() {" +

                "var modal = " +
                "document.getElementById('modal');" +

                "if (modal) {" +

                "modal.remove();" +

                "return 'MODAL_CLOSED';" +

                "}" +

                "return 'NO_MODAL';" +

                "})()",

                new ValueCallback<String>() {

                    @Override
                    public void onReceiveValue(
                            String value) {


                        if ("\"MODAL_CLOSED\""
                                .equals(value)) {


                            return;
                        }


                        webView.evaluateJavascript(

                                "(function() {" +

                                "if (window.handleAndroidBack && " +
                                "typeof window.handleAndroidBack === 'function') {" +

                                "return window.handleAndroidBack();" +

                                "}" +

                                "return false;" +

                                "})()",

                                new ValueCallback<String>() {

                                    @Override
                                    public void onReceiveValue(
                                            String result) {


                                        if ("true"
                                                .equals(result)) {


                                            return;
                                        }


                                        MainActivity.super
                                                .onBackPressed();
                                    }
                                }
                        );
                    }
                }
        );
    }


    /*
     * ============================================================
     * DESTROY
     * ============================================================
     */

    @Override
    protected void onDestroy() {


        if (driveExecutor != null) {


            driveExecutor.shutdownNow();
        }


        if (webView != null) {


            webView.stopLoading();

            webView.clearHistory();

            webView.clearCache(false);

            webView.removeAllViews();

            webView.destroy();

            webView = null;
        }


        super.onDestroy();
    }
}
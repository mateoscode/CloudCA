# Cloud Computing CA1 - Cloud Run & Firestore App

This project demonstrates a cloud-native Node.js application deployed on Google Cloud Platform (GCP) using Cloud Run and Cloud Firestore. It features an automated CI/CD pipeline via Cloud Build.

## Architecture

*   **Frontend**: Simple HTML5/CSS3 form served by Node.js.
*   **Backend**: Node.js (Express-style raw HTTP server) handling API requests.
*   **Database**: Google Cloud Firestore (NoSQL) for storing user submissions.
*   **Compute**: Google Cloud Run (Serverless Container).
*   **CI/CD**: Google Cloud Build triggered on GitHub push.
*   **Security**: Secrets management via GCP Secret Manager.

## Prerequisites

*   Google Cloud Platform Account
*   gcloud CLI installed
*   Docker installed (for local testing)
*   Node.js v20+

## Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mateoscode/CloudCA
    cd cloudCompCA
    ```

2.  **Setup Credentials:**
    *   Place your service account key as `firebase-key.json` in the root directory.
    *   **Note:** This file is ignored by git and excluded from the Docker image for security.

3.  **Install Dependencies:**
    ```bash
    npm install
    ```

4.  **Run Locally:**
    ```bash
    npm start
    ```
    Visit `http://localhost:8080`.

## Deployment

The deployment is automated using **Cloud Build**.

1.  **Trigger:** Pushing to the `main` branch on GitHub triggers the build.
2.  **Build Steps:**
    *   Builds the Docker container.
    *   Pushes the image to Google Artifact Registry.
    *   Deploys the new revision to Cloud Run.
3.  **Configuration:**
    *   See `cloudbuild.yaml` for pipeline details.
    *   Secrets (like Firestore credentials) are injected at runtime via Secret Manager.

### Service accounts & IAM adjustments

Pick (or create) a dedicated **build service account** for Cloud Build, then grant it:

- `roles/run.admin` (deploy to Cloud Run)
- `roles/artifactregistry.writer` (push container images)
- `roles/secretmanager.secretAccessor` (pass the Firestore key through `FIREBASE_CREDENTIALS`)
- `roles/iam.serviceAccountUser` on the Cloud Run runtime service account (so it can deploy revisions on that identity)

Whichever Cloud Run runtime service account you use must also have `roles/secretmanager.secretAccessor` on the `firestore-key` secret so the container can load credentials at startup. Update the README with the actual service-account emails you choose for submission/documentation.

### Connecting GitHub to Cloud Build

1. Open **Cloud Build → Triggers → Manage repositories → Connect repository**.
2. Authorize the Cloud Build GitHub App and select `mateoscode/cloud-comp-ca`.
3. Create the trigger (`cloudcompca-deploy`) pointing at `cloudbuild.yaml` and branch `^main$`.
4. After the first push, verify the pipeline in **Cloud Build → History** and confirm a new Cloud Run revision is created.

## API Endpoints

*   `GET /`: Serves the home page (`home.html`).
*   `POST /submit`: Accepts JSON or Form data (`email`, `password`) and saves to Firestore.

## Technologies Used

*   Node.js
*   Docker
*   Google Cloud Run
*   Google Cloud Firestore
*   Google Cloud Build
*   Google Artifact Registry
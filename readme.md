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

/**
 * 'Frontend logic for the application
 */

//  Container for the frontend application
 const app= {}

// Config
app.config = {
    'sessionToken': false
}

// AJAX Client (for the restful API)
app.client = {}

// Interface for making API calls
app.client.request ()
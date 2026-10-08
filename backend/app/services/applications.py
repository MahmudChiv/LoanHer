"""
Application creation service.

Called when the applicant taps "Send to Wema Bank" on their Passport page.

TODO: Implement in ClickUp task #APPLICATIONS-02
      - Expose: create_application(passport_id: str) -> Application
        - Look up the passport in store.passports (raise 404 if missing)
        - Generate a sequential ref, e.g. "APP-0001", "APP-0002"
        - Build an Application model with status="submitted" and current UTC time
        - Save to store.applications and return the model
"""

# TODO: #APPLICATIONS-02

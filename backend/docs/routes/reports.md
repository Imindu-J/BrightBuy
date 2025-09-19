### What it does:

- Creates a reports route.
- Uses your `authorize` middleware to restrict access to system_admin role only.
- Runs a query:
    ```
    SELECT * FROM Report
    ```

    → fetches all reports from the `Report` table.

- Responds with the rows as JSON.

### Key points:

- Authorization: only `system_admin` can view reports.
- Simplicity: no body params, just a simple GET request.
- But—it exposes all reports without filters (by date, type, user, etc.). For production, probably want filtering/pagination.

>**Summary:**\
This route lets only system admins fetch all reports from the database. But in the future, may want to add filters (e.g., by date range, user, or type) and pagination to handle large data.
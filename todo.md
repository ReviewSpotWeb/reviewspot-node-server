## Requirements to Complete:

- **Database/ODM**

  - Add schematics for reporting users
  - Add infrastructure for Dev, Test, and Prod DBs (including env_var for which environment we're in)

- **Users and Authentication**

  - ~Signing Up~
  - ~Logging In~
  - ~Session (and Session Store)~
  - ~User Roles and Authorized Routes~
  - Profiles
    - Route is something along the lines of api.../user/:id
    - Users should be able to do a PUT to their profile.
  - Banned Users
  - Forgot Password
  - Make separate Profile model to move bio to

- **Spotify API**

  - Searching for albums
  - ~Getting album by ID~

- **Reviews**

  - Add CRUD for Reviews
  - Add CRUD for Ratings
  - Add CRUD for Comments
  - Find Reviews by Album
    - DB index?
  - Pagination (~may actually be a front end thing~ -- it's both)

- **Moderators**
  - Ability to ban a user.
  - See reports. A `Report` contains a reason and content, and is one of a:
    - `CommentReport`
    - `ReviewReport`
  - Ban Audits -- objects to log why a user has been banned.

## Enhancements/Tech Debt:

- Possibly bring in validation library for incoming requests.
- Error handling -- and possibly a few functions to facilitate it.

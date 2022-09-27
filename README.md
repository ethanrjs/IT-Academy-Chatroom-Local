# IT-Academy-Chatroom-Local

Jacob has informed me that this project might be hosted on a VLAN, however these are the pros and cons of doing so.
### Pros
* Very reliable
* Can be accessed outside of the private IT VLAN
* Plenty of storage and resources
* Traffic not monitored by school network (https payloads)

### Cons
* Slower network speeds
* EVERYTHING needs to be encrypted (transit, storage, etc)
* Much stricter hashing standards
* Full netcode rewrite

# Changelogs

<details>
  
  <summary>9/27/2022</summary>
  
+ Added user authentication
+ Added password encryption
+ Properly configured server
+ Added login page
+ Added login and register functions

* Fixed netcode
* Fixed users being able to send html in chat
  
</details>
# TODO
* User profiles
* User roles
* Migrate accounts.json to database
* Refactor code to be cleaner
* Improve authentication methods
* Fix information pane to be a settings pane or something idk
* Add themes
* Add profile pictures to the right
* Allow profile pictures to be uploaded
* Merge messages sent by same sender to conserve space
* Log Messages
* Add message IDs to help control
* Incorporate mongodb + mongoose
* **Low Priority** LDAP Authentication


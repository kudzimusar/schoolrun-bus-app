# Incremental Development Plan: School Run Bus App

## 1. Executive Summary

The **School Run Bus App** is a complex system designed to streamline school transportation through real-time tracking, AI-driven predictions, and integrated payments. To ensure a successful launch, this plan outlines an incremental approach, starting with a **Minimum Viable Product (MVP)** that focuses on the core value proposition: **knowing where the bus is**. By prioritizing essential features and establishing a secure foundation, the project can be built and validated in manageable stages.

## 2. Defining the Minimum Viable Product (MVP)

The MVP should focus on the primary needs of parents and drivers while ensuring the system is secure and stable. The goal is to provide a functional end-to-end experience for a single school run.

| Feature Category | MVP Scope | Priority |
| :--- | :--- | :--- |
| **Security** | Secure password hashing and basic role-based access control. | **Critical** |
| **Tracking** | Real-time location updates from a driver's device to a parent's map. | **High** |
| **User Management** | Basic registration and login for Parents and Drivers. | **High** |
| **Bus/Route Info** | Static display of assigned routes and stops. | **Medium** |
| **Notifications** | Basic in-app alerts for bus arrival at key stops. | **Medium** |

## 3. Prioritized Implementation Roadmap

The following roadmap breaks down the development into logical phases, starting with the most critical foundational elements.

### Phase 1: Foundation and Security (Immediate Priority)

The first step is to transform the current "demo" authentication into a production-ready system. This ensures that user data is protected from the start.

*   **Secure Authentication**: Replace the placeholder login logic with robust password hashing (e.g., using `bcrypt`) and secure session management.
*   **Environment Configuration**: Standardize the use of environment variables for all external services (Mapbox, Paynow, etc.) across both frontend and backend.
*   **Database Baseline**: Finalize the database schema and ensure all migrations are running correctly in the Encore environment.

### Phase 2: Core Tracking Experience and Enhanced Geofencing

Once the foundation is secure, the focus shifts to the application's primary function: real-time bus tracking, enhanced with flexible geofencing.

*   **Driver Location Transmitter**: Develop a simple interface for drivers to start a "trip" and begin sending their GPS coordinates to the backend.
*   **Parent Map Viewer**: Ensure the frontend map correctly displays the live location of the assigned bus, utilizing the Mapbox integration.
*   **GeoAlert Zones (Custom Geofencing)**: Implement the ability for parents to create unlimited, custom-named geofences (polygons, not just circles) that trigger push notifications when the bus enters/exits. This expands on the existing geofencing capabilities.
*   **Real-time Data Protocol**: Leverage WebSockets or MQTT for smooth, real-time location streaming, ensuring the bus icon moves fluidly on the map.

### Phase 3: AI-Driven Predictions and Advanced Communication

With the core tracking functional, we can layer on more advanced features that improve the user experience and communication.

*   **Dynamic ETA Countdown ("Time to Leave")**: Enhance the AI-driven ETA service to provide a dynamic countdown (e.g., "Bus arrives in 4 minutes"). This requires refining the algorithm to account for traffic and historical stop times, potentially using Machine Learning.
*   **Incident Reporting**: Enable drivers to report delays or issues, which are then immediately visible on the parent's dashboard.
*   **Notification System**: Expand the notification service to include push notifications or SMS for critical updates (e.g., bus entering a GeoAlert zone, incident reported).
*   **Two-Way Forms (Communication)**: Allow parents to submit forms directly through the app (e.g., "Johnny is sick today," "Lost Item Report"), with data routed to relevant personnel (e.g., driver's tablet, school admin).

### Phase 4: Driver Safety and Student Management

This phase introduces critical safety features for drivers and student tracking functionalities.

*   **"No Sleeping Child" Workflow (Post-Trip Inspection)**: Implement a safety module for the driver app that requires a physical check (e.g., scanning an NFC tag or pressing a button at the back of the bus) before a driver can end their shift, ensuring no child is left behind.
*   **Student Scanning (Digital Bus Pass)**: Integrate a system for students to scan a barcode on their phone or an RFID card upon boarding/exiting the bus. This should trigger instant "On Board" or "Dropped Off" notifications to parents.

### Phase 5: Payments, Administration, and Advanced User Features

The final phase of the MVP involves integrating the business logic, comprehensive administrative tools, and advanced parent-centric features.

*   **Paynow Integration**: Replace EcoCash with Paynow for payment processing. This involves integrating with Paynow's API to cover various payment platforms (Visa, MasterCard, local Zimbabwean options) for wallet top-ups and bus fees.
*   **Admin Dashboard**: Provide school administrators with comprehensive tools to manage buses, routes, user accounts, view incidents, and monitor payments.
*   **Analytics and Reporting**: Begin collecting performance data to generate basic reports on route efficiency, punctuality, and student attendance.
*   **Multi-Student View**: For parents with multiple children on different buses, implement a unified map view that displays all relevant buses on a single screen.
*   **Subscription Sharing**: Allow the primary parent to securely invite others (nannies, grandparents) to view bus tracking information via a secure link, with read-only access.

## 4. Technical Recommendations for Success

To maintain momentum and code quality, the following practices should be adopted:

> "Incremental development is not just about building parts; it's about building a working system at every step." — *General Software Engineering Principle*

*   **Continuous Integration**: Use Encore's built-in deployment pipelines to test and deploy changes frequently.
*   **Automated Testing**: Prioritize writing unit tests for critical backend logic, especially in the `auth`, `location`, `payments`, and new safety/student management services.
*   **User Feedback Loops**: Even in the early stages, gather feedback from potential users (parents and drivers) to validate the interface and functionality.
*   **Hardware Agnostic Approach**: While not an immediate MVP feature, keep in mind the long-term goal of being able to read data from various sources (dedicated GPS boxes, OBDII dongles, driver app on tablet/phone).

## 5. Conclusion

By following this incremental plan, the **School Run Bus App** can move from a promising codebase to a functional, secure, and valuable tool for the school community. The immediate focus must be on securing the authentication system and establishing the core real-time tracking loop. Once these are in place, the more advanced AI, safety, and payment features can be integrated with confidence.

## References

1. [Encore.dev Documentation](https://encore.dev/docs) - Backend development and deployment.
2. [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/api/) - Interactive map implementation.
3. [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) - Best practices for secure login systems.
4. [Paynow Zimbabwe](https://www.paynow.co.zw) - Payment gateway for various platforms in Zimbabwe.

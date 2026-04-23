export type Template = {
  id: string;
  name: string;
  description: string;
  code: string;
};

export const TEMPLATES: Template[] = [
  {
    id: "flowchart",
    name: "Flowchart / Activity",
    description: "Activity flow with decisions and actions.",
    code: `@startuml
start
:User opens app;
if (Logged in?) then (yes)
  :Show dashboard;
else (no)
  :Show login screen;
  :Authenticate user;
endif
:Load data;
stop
@enduml`,
  },
  {
    id: "sequence",
    name: "Sequence Diagram",
    description: "Interactions between actors over time.",
    code: `@startuml
actor User
participant "Web App" as Web
participant "API" as API
database DB

User -> Web : Click "Login"
Web -> API : POST /login
API -> DB : Verify credentials
DB --> API : User record
API --> Web : JWT token
Web --> User : Redirect to dashboard
@enduml`,
  },
  {
    id: "class",
    name: "Class Diagram",
    description: "Object-oriented class relationships.",
    code: `@startuml
class User {
  +id: UUID
  +name: String
  +email: String
  +login(): Boolean
}

class Order {
  +id: UUID
  +total: Decimal
  +createdAt: Date
  +checkout(): void
}

class Product {
  +id: UUID
  +title: String
  +price: Decimal
}

User "1" -- "*" Order : places
Order "*" -- "*" Product : contains
@enduml`,
  },
  {
    id: "usecase",
    name: "Use Case Diagram",
    description: "Actors and system use cases.",
    code: `@startuml
left to right direction
actor Customer
actor Admin

rectangle "E-Commerce System" {
  Customer --> (Browse products)
  Customer --> (Add to cart)
  Customer --> (Checkout)
  Admin --> (Manage inventory)
  Admin --> (View reports)
}
@enduml`,
  },
  {
    id: "state",
    name: "State Diagram",
    description: "States and transitions of a system.",
    code: `@startuml
[*] --> Idle
Idle --> Loading : fetch()
Loading --> Success : 200 OK
Loading --> Error : failure
Success --> Idle : reset
Error --> Idle : retry
Success --> [*]
@enduml`,
  },
  {
    id: "component",
    name: "Component Diagram",
    description: "High-level system components.",
    code: `@startuml
package "Frontend" {
  [Web App]
  [Mobile App]
}
package "Backend" {
  [API Gateway]
  [Auth Service]
  [Orders Service]
}
database "PostgreSQL" as DB

[Web App] --> [API Gateway]
[Mobile App] --> [API Gateway]
[API Gateway] --> [Auth Service]
[API Gateway] --> [Orders Service]
[Orders Service] --> DB
[Auth Service] --> DB
@enduml`,
  },
  {
    id: "deployment",
    name: "Deployment Diagram",
    description: "Physical deployment of artifacts.",
    code: `@startuml
node "Client Device" {
  [Browser]
}
cloud "CDN" {
  [Static Assets]
}
node "App Server" {
  [Node.js API]
}
database "Database Cluster" {
  [Primary]
  [Replica]
}

[Browser] --> [Static Assets]
[Browser] --> [Node.js API]
[Node.js API] --> [Primary]
[Primary] --> [Replica]
@enduml`,
  },
  {
    id: "mindmap",
    name: "Mindmap",
    description: "Hierarchical mind map.",
    code: `@startmindmap
* Product Roadmap
** Q1
*** Auth
*** Billing
** Q2
*** Analytics
*** Integrations
** Q3
*** Mobile App
*** AI Features
@endmindmap`,
  },
  {
    id: "gantt",
    name: "Gantt Chart",
    description: "Project timeline and tasks.",
    code: `@startgantt
project starts 2025-01-06
[Design] lasts 10 days
[Development] lasts 20 days
[Development] starts at [Design]'s end
[Testing] lasts 7 days
[Testing] starts at [Development]'s end
[Launch] lasts 2 days
[Launch] starts at [Testing]'s end
@endgantt`,
  },
  {
    id: "erd",
    name: "ERD (Entity Relationship)",
    description: "Database entities and relations.",
    code: `@startuml
entity User {
  * id : UUID
  --
  * email : String
  name : String
}

entity Order {
  * id : UUID
  --
  * user_id : UUID <<FK>>
  total : Decimal
  created_at : Timestamp
}

entity OrderItem {
  * id : UUID
  --
  * order_id : UUID <<FK>>
  * product_id : UUID <<FK>>
  quantity : Int
}

entity Product {
  * id : UUID
  --
  name : String
  price : Decimal
}

User ||--o{ Order
Order ||--o{ OrderItem
Product ||--o{ OrderItem
@enduml`,
  },
];

export const DEFAULT_CODE = TEMPLATES[1].code;

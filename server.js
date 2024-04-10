const inquirer = require("inquirer");
const mysql = require("mysql2");
////const chalk = require('chalk');

// Create a MySQL connection
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "bce2e2d1",
    database: "employeeTracker_db",
});

// Connect to the database
connection.connect((err) => {
    if (err) throw err;
    console.log("Connected to the database!");
    // Start the application
    start();
});

// Function to display a formatted title
function displayEmployeeTracker() {
    const employeeTracker = `
    
 _______  __   __  _______  ___      _______  __   __  _______  _______   
 |       ||  |_|  ||       ||   |    |       ||  | |  ||       ||       |  
 |    ___||       ||    _  ||   |    |   _   ||  |_|  ||    ___||    ___|  
 |   |___ |       ||   |_| ||   |    |  | |  ||       ||   |___ |   |___   
 |    ___||       ||    ___||   |___ |  |_|  ||_     _||    ___||    ___|  
 |   |___ | ||_|| ||   |    |       ||       |  |   |  |   |___ |   |___   
 |_______||_|   |_||___|    |_______||_______|  |___|  |_______||_______|  
  _______  ______    _______  _______  ___   _  _______  ______            
 |       ||    _ |  |   _   ||       ||   | | ||       ||    _ |           
 |_     _||   | ||  |  |_|  ||       ||   |_| ||    ___||   | ||           
   |   |  |   |_||_ |       ||       ||      _||   |___ |   |_||_          
   |   |  |    __  ||       ||      _||     |_ |    ___||    __  |         
   |   |  |   |  | ||   _   ||     |_ |    _  ||   |___ |   |  | |         
   |___|  |___|  |_||__| |__||_______||___| |_||_______||___|  |_|                                      
    `;

    console.log(employeeTracker);
}

// Display "Employee Tracker" using ASCII art
displayEmployeeTracker();



// Function to Start the employee Tracker Application
function start() {
    inquirer
        .prompt({
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: [
                "View all departments",
                "View all roles",
                "View all employees",
                "Add a department",
                "Add a role",
                "Add an employee",
                "Update an employee role",
                "Exit the database",
            ],
        })
        .then((answer) => {
            switch (answer.action) {
                case "View all departments":
                    viewAllDepartments();
                    break;
                case "View all roles":
                    viewAllRoles();
                    break;
                case "View all employees":
                    viewAllEmployees();
                    break;
                case "Add a department":
                    addDepartment();
                    break;
                case "Add a role":
                    addRole();
                    break;
                case "Add an employee":
                    addEmployee();
                    break;
                case "Add a Manager":
                    addManager();
                    break;
                case "Update an employee role":
                    updateEmployeeRole();
                    break;
                case "Exit the database":
                    connection.end();
                    console.log("See you next time!");
                    break;
            }
        });
}

// Function to view all departments
function viewAllDepartments() {
    const query = "SELECT * FROM departments";
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        // Restart the application
        start();
    });
}

// Function to view all roles
function viewAllRoles() {
    const query = "SELECT roles.title, roles.id, departments.department_name, roles.salary from roles join departments on roles.department_id = departments.id";
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        // Restart the application
        start();
    });
}

// Function to view all employees
function viewAllEmployees() {
    const query = `
    SELECT e.id, e.first_name, e.last_name, r.title, d.department_name, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager_name
    FROM employee e
    LEFT JOIN roles r ON e.role_id = r.id
    LEFT JOIN departments d ON r.department_id = d.id
    LEFT JOIN employee m ON e.manager_id = m.id;
    `;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        // Restart the application
        start();
    });
}

// Function to add a department
function addDepartment() {
    inquirer
        .prompt({
            type: "input",
            name: "name",
            message: "Enter the name of the new department:",
        })
        .then((answer) => {
            const query = `INSERT INTO departments (department_name) VALUES ("${answer.name}")`;
            connection.query(query, (err, res) => {
                if (err) throw err;
                console.log(`Added department ${answer.name} to the database!`);
                // Restart the application
                start();
            });
        });
}

// Function to add a role
function addRole() {
    const query = "SELECT * FROM departments";
    connection.query(query, (err, res) => {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    type: "input",
                    name: "title",
                    message: "Enter the title of the new role:",
                },
                {
                    type: "input",
                    name: "salary",
                    message: "Enter the salary of the new role:",
                },
                {
                    type: "list",
                    name: "department",
                    message: "Select the department for the new role:",
                    choices: res.map((department) => department.department_name),
                },
            ])
            .then((answers) => {
                const department = res.find((department) => department.department_name === answers.department);
                const query = "INSERT INTO roles SET ?";
                connection.query(query, {
                    title: answers.title,
                    salary: answers.salary,
                    department_id: department.id,
                }, (err, res) => {
                    if (err) throw err;
                    console.log(`Added role ${answers.title} with salary ${answers.salary} to the ${answers.department} department in the database!`);
                    // Restart the application
                    start();
                });
            });
    });
}

// Function to add an employee
function addEmployee() {
    // Retrieve list of roles from the database
    connection.query("SELECT id, title FROM roles", (error, results) => {
        if (error) {
            console.error(error);
            return;
        }
        const roles = results.map(({ id, title }) => ({
            name: title,
            value: id,
        }));

        // Retrieve list of employees from the database to use as managers
        connection.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee', (error, results) => {
            if (error) {
                console.error(error);
                return;
            }
            const managers = results.map(({ id, name }) => ({
                name,
                value: id,
            }));

            // Prompt the user for employee information
            inquirer.prompt([
                {
                    type: "input",
                    name: "firstName",
                    message: "Enter the employee's first name:",
                },
                {
                    type: "input",
                    name: "lastName",
                    message: "Enter the employee's last name:",
                },
                {
                    type: "list",
                    name: "roleId",
                    message: "Select the employee role:",
                    choices: roles,
                },
                {
                    type: "list",
                    name: "managerId",
                    message: "Select the employee manager:",
                    choices: [{ name: "None", value: null }, ...managers],
                },
            ]).then((answers) => {
                // Insert the employee into the database
                const sql = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
                const values = [answers.firstName, answers.lastName, answers.roleId, answers.managerId];
                connection.query(sql, values, (error) => {
                    if (error) {
                        console.error(error);
                        return;
                    }
                    console.log("Employee added successfully");
                    start();
                });
            }).catch((error) => {
                console.error(error);
            });
        });
    });
}


// Function to update an employee role
function updateEmployeeRole() {
    const queryEmployees = "SELECT employee.id, employee.first_name, employee.last_name, roles.title FROM employee LEFT JOIN roles ON employee.role_id = roles.id";
    const queryRoles = "SELECT * FROM roles";
    connection.query(queryEmployees, (err, resEmployees) => {
        if (err) throw err;
        connection.query(queryRoles, (err, resRoles) => {
            if (err) throw err;
            inquirer.prompt([
                {
                    type: "list",
                    name: "employee",
                    message: "Select the employee to update:",
                    choices: resEmployees.map((employee) => `${employee.first_name} ${employee.last_name}`),
                },
                {
                    type: "list",
                    name: "role",
                    message: "Select the new role:",
                    choices: resRoles.map((role) => role.title),
                },
            ]).then((answers) => {
                const employee = resEmployees.find((employee) => `${employee.first_name} ${employee.last_name}` === answers.employee);
                const role = resRoles.find((role) => role.title === answers.role);
                const query = "UPDATE employee SET role_id = ? WHERE id = ?";
                connection.query(query, [role.id, employee.id], (err, res) => {
                    if (err) throw err;
                    console.log(`Updated ${employee.first_name} ${employee.last_name}'s role to ${role.title} in the database!`);
                    // Restart the application
                    start();
                });
            });
        });
    });
}

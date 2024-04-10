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

// Function to display a stylized title
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



// Function to Start the app
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
                //? BONUS OPTIONS
                "Update employee managers",
                "View employees by manager",
                "View employees by department",
                "Delete departments, roles, and employees",
                "View the total utilized budget in each department",
                //* EXIT
                "Exit the database"
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
                case "Update an employee role":
                    updateEmployeeRole();
                    break;
                //? BONUS
                case "Update employee managers":
                    addManager();
                    break;
                case "View employees by manager":
                    viewEmployeesByManager();    
                    break;
                case "View employees by department":
                    viewEmployeesByDepartment();
                    break;
                case "Delete departments, roles, and employees":
                    deleteDepartmentsRolesEmployees();
                    break;
                case "View the total utilized budget in each department":
                    viewTotalUtilizedBudgetOfDepartments();
                    break;
                //* EXIT
                case "Exit the database":
                    connection.end();
                    console.log("See you next time!");
                    break;
            }
        });
}

// Function to view all departments
function viewAllDepartments() {
    console.log("Viewing all departments...");
    const query = "SELECT * FROM departments";
    connection.query(query, (err, res) => {
        if (err) {
            console.error("Error fetching departments:", err);
            return;
        }
        console.log("Departments:");
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
        if (err) {
            console.error("Error fetching departments:", err);
            return;
        }

        if (res.length === 0) {
            console.log("No departments found. Please add a department first.");
            start();
            return;
        }

        // Format the choices for departments
        const departmentChoices = res.map((department) => ({
            name: department.department_name,
            value: department.id,
        }));

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
                    name: "departmentId",
                    message: "Select the department for the new role:",
                    choices: departmentChoices,
                },
            ])
            .then((answers) => {
                const query = "INSERT INTO roles SET ?";
                const role = {
                    title: answers.title,
                    salary: answers.salary,
                    department_id: answers.departmentId,
                };

                connection.query(query, role, (err, res) => {
                    if (err) {
                        console.error("Error adding role:", err);
                        return;
                    }
                    console.log(`Added role ${role.title} with salary ${role.salary} to the database!`);
                    // Restart the application
                    start();
                });
            })
            .catch((error) => {
                console.error("Error with inquirer prompt:", error);
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

// Function to add a Manager
function addManager() {
    const queryDepartments = "SELECT * FROM departments";
    const queryEmployees = "SELECT * FROM employee";

    connection.query(queryDepartments, (err, resDepartments) => {
        if (err) throw err;
        connection.query(queryEmployees, (err, resEmployees) => {
            if (err) throw err;
            inquirer
                .prompt([
                    {
                        type: "list",
                        name: "department",
                        message: "Select the department:",
                        choices: resDepartments.map(
                            (department) => department.department_name
                        ),
                    },
                    {
                        type: "list",
                        name: "employee",
                        message: "Select the employee to add a manager to:",
                        choices: resEmployees.map(
                            (employee) =>
                                `${employee.first_name} ${employee.last_name}`
                        ),
                    },
                    {
                        type: "list",
                        name: "manager",
                        message: "Select the employee's manager:",
                        choices: resEmployees.map(
                            (employee) =>
                                `${employee.first_name} ${employee.last_name}`
                        ),
                    },
                ])
                .then((answers) => {
                    const department = resDepartments.find(
                        (department) =>
                            department.department_name === answers.department
                    );
                    const employee = resEmployees.find(
                        (employee) =>
                            `${employee.first_name} ${employee.last_name}` ===
                            answers.employee
                    );
                    const manager = resEmployees.find(
                        (employee) =>
                            `${employee.first_name} ${employee.last_name}` ===
                            answers.manager
                    );
                    const query =
                        "UPDATE employee SET manager_id = ? WHERE id = ? AND role_id IN (SELECT id FROM roles WHERE department_id = ?)";
                    connection.query(
                        query,
                        [manager.id, employee.id, department.id],
                        (err, res) => {
                            if (err) throw err;
                            console.log(
                                `Added manager ${manager.first_name} ${manager.last_name} to employee ${employee.first_name} ${employee.last_name} in department ${department.department_name}!`
                            );
                            // restart the application
                            start();
                        }
                    );
                });
        });
    });
}

// Function to View Employee By Manager
function viewEmployeesByManager() {
    const query = `
      SELECT 
        e.id, 
        e.first_name, 
        e.last_name, 
        r.title, 
        d.department_name, 
        CONCAT(m.first_name, ' ', m.last_name) AS manager_name
      FROM 
        employee e
        INNER JOIN roles r ON e.role_id = r.id
        INNER JOIN departments d ON r.department_id = d.id
        LEFT JOIN employee m ON e.manager_id = m.id
      ORDER BY 
        manager_name, 
        e.last_name, 
        e.first_name
    `;

    connection.query(query, (err, res) => {
        if (err) throw err;

        // group employees by manager
        const employeesByManager = res.reduce((acc, cur) => {
            const managerName = cur.manager_name;
            if (acc[managerName]) {
                acc[managerName].push(cur);
            } else {
                acc[managerName] = [cur];
            }
            return acc;
        }, {});

        // display employees by manager
        console.log("Employees by manager:");
        for (const managerName in employeesByManager) {
            console.log(`\n${managerName}:`);
            const employees = employeesByManager[managerName];
            employees.forEach((employee) => {
                console.log(
                    `  ${employee.first_name} ${employee.last_name} | ${employee.title} | ${employee.department_name}`
                );
            });
        }

        // restart the application
        start();
    });
}
// Function to view Employees by Department
function viewEmployeesByDepartment() {
    const query =
        "SELECT departments.department_name, employee.first_name, employee.last_name FROM employee INNER JOIN roles ON employee.role_id = roles.id INNER JOIN departments ON roles.department_id = departments.id ORDER BY departments.department_name ASC";

    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log("\nEmployees by department:");
        console.table(res);
        // restart the application
        start();
    });
}

// Function to Delete departments, roles, and employees
function deleteDepartmentsRolesEmployees() {
    inquirer
        .prompt({
            type: "list",
            name: "deleteOption",
            message: "What would you like to delete?",
            choices: ["Departments", "Roles", "Employees"],
        })
        .then((answer) => {
            switch (answer.deleteOption) {
                case "Departments":
                    deleteDepartment();
                    break;
                case "Roles":
                    deleteRole();
                    break;
                case "Employees":
                    deleteEmployee();
                    break;
            }
        });
}

// Function to delete a department
function deleteDepartment() {
    const query = "SELECT * FROM departments";
    connection.query(query, (err, res) => {
        if (err) throw err;

        inquirer
            .prompt({
                type: "list",
                name: "department",
                message: "Select the department to delete:",
                choices: res.map((department) => department.department_name),
            })
            .then((answer) => {
                const department = res.find(
                    (dept) => dept.department_name === answer.department
                );
                const query = "DELETE FROM departments WHERE id = ?";
                connection.query(query, [department.id], (err, res) => {
                    if (err) throw err;
                    console.log(`Deleted department ${department.department_name} from the database!`);
                    // Restart the application
                    start();
                });
            });
    });
}

// Function to delete a role
function deleteRole() {
    const query = "SELECT * FROM roles";
    connection.query(query, (err, res) => {
        if (err) throw err;

        inquirer
            .prompt({
                type: "list",
                name: "role",
                message: "Select the role to delete:",
                choices: res.map((role) => role.title),
            })
            .then((answer) => {
                const role = res.find((role) => role.title === answer.role);
                const query = "DELETE FROM roles WHERE id = ?";
                connection.query(query, [role.id], (err, res) => {
                    if (err) throw err;
                    console.log(`Deleted role ${role.title} from the database!`);
                    // Restart the application
                    start();
                });
            });
    });
}

// Function to delete an employee
function deleteEmployee() {
    const query = "SELECT * FROM employee";
    connection.query(query, (err, res) => {
        if (err) throw err;

        inquirer
            .prompt({
                type: "list",
                name: "employee",
                message: "Select the employee to delete:",
                choices: res.map(
                    (employee) => `${employee.first_name} ${employee.last_name}`
                ),
            })
            .then((answer) => {
                const employee = res.find(
                    (emp) =>
                        `${emp.first_name} ${emp.last_name}` === answer.employee
                );
                const query = "DELETE FROM employee WHERE id = ?";
                connection.query(query, [employee.id], (err, res) => {
                    if (err) throw err;
                    console.log(`Deleted employee ${answer.employee} from the database!`);
                    // Restart the application
                    start();
                });
            });
    });
}

// Function to view the total utilized budget of a department
function viewTotalUtilizedBudgetOfDepartments() {
    const query = `
    SELECT departments.department_name, SUM(roles.salary) AS utilized_budget
    FROM employee
    INNER JOIN roles ON employee.role_id = roles.id
    INNER JOIN departments ON roles.department_id = departments.id
    GROUP BY departments.id, departments.department_name
    `;

    connection.query(query, (err, res) => {
        if (err) throw err;

        console.log("Total Utilized Budget of Each Department:");
        res.forEach((row) => {
            console.log(`${row.department_name}: $${row.utilized_budget}`);
        });

        // Restart the application
        start();
    });
}




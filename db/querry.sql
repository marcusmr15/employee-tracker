-- Get all departments
SELECT * FROM departments;

-- Get all roles
SELECT * FROM roles;

-- Get all employees with their roles and departments
SELECT 
    e.id AS employee_id, 
    e.first_name, 
    e.last_name, 
    r.title AS role_title, 
    d.department_name
FROM 
    employee e
JOIN 
    roles r ON e.role_id = r.id
JOIN 
    departments d ON r.department_id = d.id;

-- Get total salary budget for a department
SELECT 
    d.department_name, 
    SUM(r.salary) AS total_salary_budget
FROM 
    departments d
JOIN 
    roles r ON d.id = r.department_id
GROUP BY 
    d.department_name;

-- Update an employee's role
UPDATE employee
SET role_id = (SELECT id FROM roles WHERE title = 'New Role')
WHERE employee_id = 123;

-- Add a new department
INSERT INTO departments (department_name) VALUES ('New Department');

-- Add a new role
INSERT INTO roles (title, salary, department_id) VALUES ('New Role', 50000, 1);

-- Delete an employee
DELETE FROM employee WHERE id = 123;

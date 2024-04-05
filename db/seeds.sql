-- Insert departments
INSERT INTO departments (department_name)
VALUES 
  ('Executive Board'),
  ('Marketing'),
  ('Human Resources'),
  ('Finance'),
  ('Engineering'),
  ('Information Technology'),
  ('Customer Relations'),
  ('Research and Development'),
  ('Legal'),
  ('Maintenance');

-- Insert roles
INSERT INTO roles (title, salary, department_id)
VALUES 
  ('Chief Executive Officer', 555000.00, 1),
  ('Marketing Manager', 125000.00, 2),
  ('HR Director', 189000.00, 3),
  ('Finance Head', 145000.00, 4),
  ('Senior Engineer', 185000.00, 5),
  ('IT Manager', 125000.00, 6),
  ('Customer Relations Manager', 75000.00, 7),
  ('Research and Development Manager', 185000.00, 8),
  ('Legal Manager', 95000.00, 9),
  ('Maintenance Manager', 135000.00, 10);

-- Insert employees
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
  ('Emily', 'Johnson', 1, 1),
  ('Daniel', 'Lee', 2, 2),
  ('Sophia', 'Rodriguez', 3, 3),
  ('Michael', 'Clark', 4, 4),
  ('Olivia', 'Martinez', 5, 5),
  ('Ethan', 'Nguyen', 6, 6),
  ('Ava', 'Brown', 7, 7),
  ('Alexander', 'Patel', 8, 8),
  ('Mia', 'Garcia', 9, 9),
  ('William', 'Khan', 10, 10);

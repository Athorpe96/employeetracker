const consoleTable = require("console.table");
const inquirer = require("inquirer");
const clear = require("clear");
const cliArt = require("figlet");
const mysql = require("mysql");
const util = require("util");
const chalk = require("chalk");


//connection to Database
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Austin96",
    database: "employee_trackerDB"
});
connection.connect(function (err) {
    if (err) throw err;

    //Initiates function
    clear();

    //Produces ASCII art
    console.log(chalk.green(cliArt.textSync('Austin Thorpe', { horizontalLayout: 'fitted' })));
    console.log("\n");

    //Calls initiate()
    initiate();
});

connection.query = util.promisify(connection.query);



//Ask the user questions
function initiate() {
    inquirer
        .prompt([
            {
                name: "userSelect",
                type: "list",
                message: "Please choose from the actions listed to proceed.",
                choices: ["View an entry", "Add an entry", "Update an entry", "Exit Menu"]
            }
        ])
        .then(answer => {
            if (answer.userSelect === "View an entry") {
                viewEntry();
            }
            else if (answer.userSelect === "Add an entry") {
                addEntry();
            }
            else if (answer.userSelect === "Update an entry") {
                updateEntry();
            }
            else if (answer.userSelect === "Exit Menu") {
                endProgram();
            }
        });
}



//Asks user what they would like to view
function viewEntry() {
    inquirer
        .prompt([
            {
                name: "userView",
                type: "list",
                message: "What would you like to view?",
                choices: ["View departments", "View roles", "View employees",
                    "View employees by department", "View employees by role", "View managers", "Return to menu"]
            }
        ])
        .then(answer => {
            if (answer.userView === "View departments") {
                viewDepartment();
            }
            else if (answer.userView === "View roles") {
                viewRoles();
            }
            else if (answer.userView === "View employees") {
                viewEmployees();
            }
            else if (answer.userView === "View employees by department") {
                employeeDepartment();
            }
            else if (answer.userView === "View employees by role") {
                employeeRole();
            }
            else if (answer.userView === "View managers") {
                viewManager();
            }
            else if (answer.userView === "Return to menu") {
                initiate();
            }
            else {
                connection.end();
            }
        })
}



//Asks user what they would like to add
function addEntry() {
    inquirer
        .prompt([
            {
                name: "userAdd",
                type: "list",
                message: "What would you like to add?",
                choices: ["Add a department", "Add an employee", "Add a job role", "Return to menu"]
            }
        ])
        .then(answer => {
            if (answer.userAdd === "Add a department") {
                addDepartment();
            }
            else if (answer.userAdd === "Add an employee") {
                addEmployee();
            }
            else if (answer.userAdd === "Add a job role") {
                addRole();
            }
            else if (answer.userAdd === "Return to menu") {
                initiate();
            }
            else {
                connection.end();
            }
        })
}



//Asks user what they would like to update
function updateEntry() {
    inquirer
        .prompt([
            {
                name: "userUpdate",
                type: "list",
                message: "What would you like to change?",
                choices: ["Delete department", "Delete job role", "Delete an employee", "Update an employee's role", "Return to menu"]
            }
        ])
        .then(answer => {
            if (answer.userUpdate === "Delete department") {
                deleteDepartment();
            }
            else if (answer.userUpdate === "Delete an employee") {
                deleteEmployee();
            }
            else if (answer.userUpdate === "Delete job role") {
                deleteRole();
            }
            else if (answer.userUpdate === "Update an employee's role") {
                updateEmployeeRole();
            }
            else if (answer.userUpdate === "Return to menu") {
                initiate();
            }
            else {
                connection.end();
            }
        })
}






//Asks user to add employee
function addEmployee() {
    readRoles().then(roles => {
        const userRole = roles.map(({ title: name, id: value }) => ({ name, value }));
        inquirer
            .prompt([
                {
                    name: "firstName",
                    type: "input",
                    message: "Please enter the employee's first name:"
                },
                {
                    name: "lastName",
                    type: "input",
                    message: "Please enter the employee's last name:"
                },
                {
                    name: "employeeRole",
                    type: "list",
                    message: "Please select the employee's job role:",
                    choices: userRole
                },
                {
                    name: "employeesManager",
                    type: "input",
                    message: "Please enter the name of this employee's manager. If none, type N/A :",
                }
            ])
            .then(answer => {
                connection.query(
                    "INSERT INTO employee SET ?",
                    {
                        first_name: answer.firstName,
                        last_name: answer.lastName,
                        role_id: answer.employeeRole,
                        manager_name: answer.employeesManager

                    },
                    (err => {
                        if (err) throw err;
                        console.log("\n");
                        console.log("Employee added succesfully!")
                        console.log("\n");
                        initiate();
                    })
                )
            })
    })
}


//Asks user what department they'd like to add
function addDepartment() {
    inquirer
        .prompt([
            {
                name: "userDepartment",
                type: "input",
                message: "What department would you like to add?"
            }
        ])
        .then(answer => {
            connection.query(
                "INSERT INTO department SET ?",
                {
                    name: answer.userDepartment
                },
                (err => {
                    if (err) throw err;
                    console.log("\n");
                    console.log("Successfully added a department.")
                    console.log("\n");
                    initiate();
                })
            )
        })
}








//Deletes department from DB
function deleteDepartment() {
    readDept().then(department => {
        const delDept = department.map(({ name: name, id: value }) => ({ name, value }));
        inquirer
            .prompt([
                {
                    name: "deleteDept",
                    type: "list",
                    message: "Please choose the department you'd like to delete:",
                    choices: delDept
                }
            ])
            .then(answer => {
                connection.query("DELETE FROM department WHERE id = ?", [answer.deleteDept],
                    async function (err, res) {
                        if (err) throw err;
                        try {
                            console.log("\n");
                            console.log("Department successfully removed!")
                            console.log("\n");
                            await initiate();
                        }
                        catch (err) {
                            console.log(err);
                        }
                    });
            });

    });
};


//Asks user to add a role
function addRole() {
    readDept().then(department => {
        const DeptChoice = department.map(({ name: name, id: value }) => ({ name, value }));
        inquirer
            .prompt([
                {
                    name: "userRoleAdd",
                    type: "input",
                    message: "What is the name of the role?:"
                },
                {
                    name: "userSalaryAdd",
                    type: "input",
                    message: "What is the salary for this role? integers only:"
                },
                {
                    name: "userRoleDeptAdd",
                    type: "list",
                    message: "What department will this role be for?:",
                    choices: DeptChoice
                }
            ])
            .then(answer => {
                connection.query(
                    "INSERT INTO roles SET ?",
                    {
                        title: answer.userRoleAdd,
                        salary: answer.userSalaryAdd,
                        department_id: answer.getDeptChoice
                    },
                    (err => {
                        if (err) throw err;
                        console.log("\n");
                        console.log("New role successfully added!")
                        console.log("\n");
                        initiate();
                    })
                )
            })
    })
}



//Searches employess by department
function employeeDepartment() {
    readDept().then(department => {
        const employeeDept = department.map(({ name: name, id: value }) => ({ name, value }));
        inquirer
            .prompt([
                {
                    name: "employeeDepartment",
                    type: "list",
                    message: "Please select the department that you would like to view:",
                    choices: employeeDept,
                }
            ])
            .then(answer => {

                let query = "SELECT * FROM employee WHERE role_id = ?";
                connection.query(query, [answer.employeeDepartment],
                    async function (err, res) {
                        if (err) throw err;

                        try {
                            console.log("\n");
                            console.table("Roles", res);
                            console.log("\n");
                            await initiate();
                        }
                        catch (err) {
                            console.log(err);
                        }
                    }
                )
            })
            .catch(err => {
                console.log(err);
            })
    })
};



//Searches employees by role
function employeeRole() {
    readRoles().then(roles => {
        const employeeRole = roles.map(({ title: name, id: value }) => ({ name, value }));
        inquirer
            .prompt({
                name: "userEmployeeRole",
                type: "list",
                message: "Select the role that you would like the employee to have:",
                choices: employeeRole
            })
            .then(answer => {
                let query = "Select * FROM employee WHERE role_id = ?";
                connection.query(query, [answer.userEmployeeRole],
                    async function (err, res) {
                        if (err) throw err;

                        try {
                            console.log("\n");
                            console.table("Employee", res);
                            console.log("\n");
                            await initiate();
                        }
                        catch (err) {
                            console.log(err);
                        }
                    })
            })
            .catch(err => {
                console.log(err);
            })
    })
}



//Deletes employee from DB
function deleteEmployee() {
    readEmployee().then(employee => {
        const delEmployee = employee.map(({ first_name: name, id: value }) => ({ name, value }));

        inquirer
            .prompt([
                {
                    name: "deleteEmp",
                    type: "list",
                    message: "Please select the employee that you would like to delete:",
                    choices: delEmployee
                }
            ])
            .then(answer => {
                connection.query("DELETE FROM employee WHERE id = ?", [answer.deleteEmp],
                    async function (err, res) {
                        if (err) throw err;
                        try {
                            console.log("\n");
                            console.log("Employee is long gone!")
                            console.log("\n");
                            await initiate();
                        }
                        catch (err) {
                            console.log(err);
                        }
                    });
            });
    });
};







//Updating an employee role
async function updateEmployeeRole() {
    try {
        const roles = await readRoles();
        const employee = await readEmployee();

        const allRole = roles.map(({ title: name, id: value }) => ({ name, value }));
        const allEmp = employee.map(({ first_name: name, id: value }) => ({ name, value }));

        inquirer
            .prompt([
                {
                    name: "userEmployee",
                    type: "list",
                    message: "Please choose the employee you would like to change:",
                    choices: allEmp
                },
                {
                    name: "userRole",
                    type: "list",
                    message: "Please select the new role you would like to change:",
                    choices: allRole
                }
            ])
            .then(answer => {
                connection.query("UPDATE employee SET role_id = ? WHERE role_id = ?;", [answer.userEmployee, answer.userRole],
                    async function (err, res) {
                        if (err) throw err;
                        try {
                            console.log("\n");
                            console.log("Employee successfully reassigned new role!");
                            console.log("\n");
                            await initiate();
                        }
                        catch (err) {
                            console.log(err);
                        }
                    })
            })
    }
    catch (err) {
        console.log(err);
    }
}

//Deletes role from DB
function deleteRole() {
    readRoles().then(roles => {
        const delRoles = roles.map(({ title: name, id: value }) => ({ name, value }));
        inquirer
            .prompt([
                {
                    name: "deleteRole",
                    type: "list",
                    message: "Please select the role you would like to delete:",
                    choices: delRoles
                }
            ])
            .then(answer => {
                connection.query("DELETE FROM roles WHERE id = ?", [answer.deleteRole],
                    async function (err, res) {
                        if (err) throw err;
                        try {
                            console.log("Job role successfully removed!")
                            await initiate();
                        }
                        catch (err) {
                            console.log(err);
                        }
                    });

            })
    })
}



//Functions to call information from database

//Views department from DB
function viewDepartment() {
    connection.query("SELECT * FROM department;",
        async function (err, res) {
            try {
                if (err) throw err;
                console.log("\n");
                console.table("department", res);
                console.log("\n");
                await initiate();
            }
            catch (err) {
                console.log(err);
            }
        })
}







//Views job roles
function viewRoles() {
    connection.query("SELECT * FROM roles;",
        async function (err, res) {
            try {
                if (err) throw err;
                console.log("\n");
                console.table("roles", res);
                console.log("\n");
                await initiate();
            }
            catch (err) {
                console.log(err);
            }
        })
}


//Views employees
function viewEmployees() {
    connection.query("SELECT * FROM employee;",
        async function (err, res) {
            try {
                if (err) throw err;
                console.log("\n");
                console.table("employee", res);
                console.log("\n");
                await initiate();
            }
            catch (err) {
                console.log(err);
            }
        })
}



//Views managers 
function viewManager() {
    connection.query("SELECT manager_name AS Manager, CONCAT(first_name, ' ', last_name) AS Employee FROM employee;",
        async function (err, res) {
            try {
                if (err) throw err;
                console.log("\n");
                console.table("employee", res);
                console.log("\n");
                await initiate();
            }
            catch (err) {
                console.log(err);
            }
        })
}



//Reads the roles
function readRoles() {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM roles;",
            function (err, res) {
                if (err) reject(err);
                resolve(res);
            })
    })
}




//Reads employees 
function readEmployee() {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM employee",
            function (err, res) {
                if (err) reject(err);
                resolve(res);
            });
    });
};


//Reads department 
function readDept() {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM department;",
            function (err, res) {
                if (err) reject(err);
                resolve(res);
            })
    })
}




//End the program and cuts connection to database
function endProgram() {
    clear();
    console.log(chalk.cyanBright(">>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<"));
    console.log(chalk.blueBright(">>>>                                            <<<<"));
    console.log(chalk.greenBright("****  Thank you for using Employee Tracker   ****"));
    console.log(chalk.blueBright(">>>>                                            <<<<"));
    console.log(chalk.cyanBright(">>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<"));
    console.log(chalk.blueBright(">>>>                                            <<<<"));
    console.log(chalk.greenBright("****                SEE YA!!!                  ****"));
    console.log(chalk.blueBright(">>>>    _________________________________                                     <<<<"));
    console.log(chalk.blueBright(">>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<"));

    process.exit();
}
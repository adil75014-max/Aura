<script>
// --------------------------------------------------
//  MODULE UTILISATEURS LOCALSTORAGE (V2)
// --------------------------------------------------

// Clé de stockage
const USERS_KEY = "usersData_v2";
const BRUTE_FORCE_KEY = "loginAttempts_v2";

// Rôles autorisés
const ROLES = ["superviseur", "stationnaire", "agent"];

// --------------------------------------------------
//  INITIALISATION
// --------------------------------------------------
function initUsers() {
    if (!localStorage.getItem(USERS_KEY)) {
        const defaultData = {
            users: [
                {
                    id: "SUP-0001",
                    username: "superviseur1",
                    role: "superviseur",
                    password: "$2b$10$Q0u1kqYp7x8l9wZ2V8E5Uu0mQx9pZyJk8t7r6e5w4q3p2o1nM8F2" // hash du mot de passe "1234"
                }
            ]
        };
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultData));
    }
}

function getUsersData() {
    initUsers();
    return JSON.parse(localStorage.getItem(USERS_KEY));
}

function saveUsersData(data) {
    localStorage.setItem(USERS_KEY, JSON.stringify(data));
}

// --------------------------------------------------
//  CRUD UTILISATEURS
// --------------------------------------------------
function createUser(username, role, plainPassword) {
    const data = getUsersData();

    if (!ROLES.includes(role)) {
        throw new Error("Rôle invalide");
    }

    if (data.users.find(u => u.username === username)) {
        throw new Error("Identifiant déjà utilisé");
    }

    const id = role.toUpperCase().slice(0,3) + "-" + String(data.users.length + 1).padStart(4, "0");

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(plainPassword, salt);

    const user = { id, username, role, password: hash };
    data.users.push(user);
    saveUsersData(data);
    return user;
}

function updateUserPassword(username, newPlainPassword) {
    const data = getUsersData();
    const user = data.users.find(u => u.username === username);
    if (!user) throw new Error("Utilisateur introuvable");

    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(newPlainPassword, salt);
    saveUsersData(data);
}

function deleteUser(username) {
    const data = getUsersData();
    data.users = data.users.filter(u => u.username !== username);
    saveUsersData(data);
}

function findUser(username, role) {
    const data = getUsersData();
    return data.users.find(u => u.username === username && u.role === role);
}

// --------------------------------------------------
//  BRUTE FORCE PROTECTION
// --------------------------------------------------
function getLoginAttempts() {
    const raw = localStorage.getItem(BRUTE_FORCE_KEY);
    return raw ? JSON.parse(raw) : { count: 0, blockedUntil: 0 };
}

function saveLoginAttempts(obj) {
    localStorage.setItem(BRUTE_FORCE_KEY, JSON.stringify(obj));
}

function registerFailedAttempt() {
    const attempts = getLoginAttempts();
    attempts.count += 1;

    if (attempts.count >= 5) {
        attempts.blockedUntil = Date.now() + 5 * 60 * 1000; // 5 minutes
    }

    saveLoginAttempts(attempts);
}

function resetAttempts() {
    saveLoginAttempts({ count: 0, blockedUntil: 0 });
}

function isBlocked() {
    const attempts = getLoginAttempts();

    if (attempts.blockedUntil && Date.now() < attempts.blockedUntil) {
        return true;
    }

    if (attempts.blockedUntil && Date.now() >= attempts.blockedUntil) {
        resetAttempts();
        return false;
    }

    return false;
}
</script>
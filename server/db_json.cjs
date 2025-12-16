const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, '..', 'data', 'digikoder.json');
const ensure = () => {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ contents: [], profiles: [], users: [] }, null, 2));
};

const load = () => {
  ensure();
  const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  // Ensure users array exists
  if (!data.users) data.users = [];
  return data;
};

const save = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

const getContents = () => load().contents.slice().sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
const getContentById = (id) => load().contents.find(c => String(c.id) === String(id));
const getContentByUrl = (url) => load().contents.find(c => c.url === url);
const insertContent = (item) => {
  const data = load();
  const nextId = (data.contents.reduce((m, x) => Math.max(m, Number(x.id || 0)), 0) || 0) + 1;
  const newItem = Object.assign({ id: nextId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, item);
  data.contents.push(newItem);
  save(data);
  return newItem;
};
const updateContent = (id, updated) => {
  const data = load();
  const idx = data.contents.findIndex(c => String(c.id) === String(id));
  if (idx === -1) return null;
  data.contents[idx] = Object.assign({}, data.contents[idx], updated, { updated_at: new Date().toISOString() });
  save(data);
  return data.contents[idx];
};
const deleteContent = (id) => {
  const data = load();
  const before = data.contents.length;
  data.contents = data.contents.filter(c => String(c.id) !== String(id));
  save(data);
  return data.contents.length !== before;
};

const getProfileByEmail = (email) => load().profiles.find(p => p.email === email);
const insertProfile = (profile) => {
  const data = load();
  data.profiles.push(Object.assign({ created_at: new Date().toISOString() }, profile));
  save(data);
  return profile;
};

// User management with authentication
const getUsers = () => load().users || [];
const getUserByEmail = (email) => (load().users || []).find(u => u.email === email);
const getUserById = (id) => (load().users || []).find(u => String(u.id) === String(id));

const createUser = async (email, password, role = 'admin') => {
  const data = load();
  if (!data.users) data.users = [];
  
  const exists = data.users.find(u => u.email === email);
  if (exists) throw new Error('User already exists');
  
  const nextId = (data.users.reduce((m, x) => Math.max(m, Number(x.id || 0)), 0) || 0) + 1;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const newUser = {
    id: nextId,
    email,
    password: hashedPassword,
    role, // 'superadmin' or 'admin'
    created_at: new Date().toISOString()
  };
  
  data.users.push(newUser);
  save(data);
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

const validatePassword = async (email, password) => {
  const user = getUserByEmail(email);
  if (!user || !user.password) return null;
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const deleteUser = (id) => {
  const data = load();
  const before = data.users.length;
  data.users = data.users.filter(u => String(u.id) !== String(id));
  save(data);
  return data.users.length !== before;
};

module.exports = {
  load, save, 
  getContents, getContentById, getContentByUrl, insertContent, updateContent, deleteContent, 
  getProfileByEmail, insertProfile,
  getUsers, getUserByEmail, getUserById, createUser, validatePassword, deleteUser
};

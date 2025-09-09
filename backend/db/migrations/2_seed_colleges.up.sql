-- Seed a system user if it doesn't exist
INSERT INTO users (id, email, name, image_url)
VALUES ('system-user', 'system@studyflow.app', 'System', '')
ON CONFLICT (id) DO NOTHING;

-- Seed colleges
INSERT INTO colleges (name, location, acceptance_rate, avg_gpa, avg_sat, avg_act, details, created_by) VALUES
('Harvard University', 'Cambridge, MA', 3.4, 4.18, 1520, 34, '{"type": "Private", "founded": 1636, "enrollment": 23000, "tuition": 54000}', 'system-user'),
('Stanford University', 'Stanford, CA', 3.9, 4.18, 1505, 34, '{"type": "Private", "founded": 1885, "enrollment": 17000, "tuition": 56000}', 'system-user'),
('Massachusetts Institute of Technology', 'Cambridge, MA', 4.1, 4.17, 1535, 35, '{"type": "Private", "founded": 1861, "enrollment": 11000, "tuition": 57000}', 'system-user'),
('University of California, Berkeley', 'Berkeley, CA', 14.5, 3.89, 1415, 32, '{"type": "Public", "founded": 1868, "enrollment": 45000, "tuition": 14000}', 'system-user'),
('Yale University', 'New Haven, CT', 4.6, 4.14, 1515, 34, '{"type": "Private", "founded": 1701, "enrollment": 13000, "tuition": 59000}', 'system-user'),
('Princeton University', 'Princeton, NJ', 4.0, 4.16, 1520, 34, '{"type": "Private", "founded": 1746, "enrollment": 5400, "tuition": 56000}', 'system-user'),
('University of California, Los Angeles', 'Los Angeles, CA', 10.8, 3.93, 1405, 31, '{"type": "Public", "founded": 1919, "enrollment": 47000, "tuition": 13000}', 'system-user'),
('Columbia University', 'New York, NY', 3.9, 4.15, 1510, 34, '{"type": "Private", "founded": 1754, "enrollment": 33000, "tuition": 61000}', 'system-user'),
('University of Chicago', 'Chicago, IL', 6.2, 4.13, 1520, 34, '{"type": "Private", "founded": 1890, "enrollment": 17000, "tuition": 59000}', 'system-user'),
('University of Pennsylvania', 'Philadelphia, PA', 5.9, 4.11, 1510, 34, '{"type": "Private", "founded": 1740, "enrollment": 25000, "tuition": 58000}', 'system-user')
ON CONFLICT (name) DO NOTHING;

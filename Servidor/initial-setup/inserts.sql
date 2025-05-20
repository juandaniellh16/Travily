USE defaultdb;

INSERT INTO users (name, username, email, password_hash, avatar, followers, following) VALUES
  ('Javi Pérez', 'javi_perez', 'javi.perez@example.com', '$2b$10$rChE4CBp0eNVptrddHXCSOMFZHnLPOWhvf1Ux0wK.QCioX.2nqppq', 'https://images.pexels.com/photos/1452717/pexels-photo-1452717.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 4, 4),
  ('Antonio Gómez', 'antonio_gomez1', 'antonio.gomez@example.com', '$2b$10$rChE4CBp0eNVptrddHXCSOMFZHnLPOWhvf1Ux0wK.QCioX.2nqppq', 'https://images.pexels.com/photos/1084165/pexels-photo-1084165.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 4, 4),
  ('Marta López', 'marta_lopez25', 'marta.lopez@example.com', '$2b$10$rChE4CBp0eNVptrddHXCSOMFZHnLPOWhvf1Ux0wK.QCioX.2nqppq', 'https://images.pexels.com/photos/20787/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 4, 4),
  ('Lucía Fernández', 'lucia_fernandez', 'lucia.fernandez@example.com', '$2b$10$rChE4CBp0eNVptrddHXCSOMFZHnLPOWhvf1Ux0wK.QCioX.2nqppq', 'https://images.pexels.com/photos/731022/pexels-photo-731022.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 4, 4),
  ('Dani García', 'dani_garcia10', 'dani.garcia@example.com', '$2b$10$rChE4CBp0eNVptrddHXCSOMFZHnLPOWhvf1Ux0wK.QCioX.2nqppq', 'https://images.pexels.com/photos/2194261/pexels-photo-2194261.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 4, 4),
  ('Juan Daniel', 'juandaniel16', 'juandaniel16@gmail.com', '$2b$10$rChE4CBp0eNVptrddHXCSOMFZHnLPOWhvf1Ux0wK.QCioX.2nqppq', null, 0, 0);

INSERT INTO followers (follower_id, following_id) VALUES
((SELECT id FROM users WHERE username = 'javi_perez'), (SELECT id FROM users WHERE username = 'antonio_gomez1')),
((SELECT id FROM users WHERE username = 'javi_perez'), (SELECT id FROM users WHERE username = 'marta_lopez25')),
((SELECT id FROM users WHERE username = 'javi_perez'), (SELECT id FROM users WHERE username = 'lucia_fernandez')),
((SELECT id FROM users WHERE username = 'javi_perez'), (SELECT id FROM users WHERE username = 'dani_garcia10')),
((SELECT id FROM users WHERE username = 'antonio_gomez1'), (SELECT id FROM users WHERE username = 'javi_perez')),
((SELECT id FROM users WHERE username = 'antonio_gomez1'), (SELECT id FROM users WHERE username = 'marta_lopez25')),
((SELECT id FROM users WHERE username = 'antonio_gomez1'), (SELECT id FROM users WHERE username = 'lucia_fernandez')),
((SELECT id FROM users WHERE username = 'antonio_gomez1'), (SELECT id FROM users WHERE username = 'dani_garcia10')),
((SELECT id FROM users WHERE username = 'dani_garcia10'), (SELECT id FROM users WHERE username = 'javi_perez')),
((SELECT id FROM users WHERE username = 'dani_garcia10'), (SELECT id FROM users WHERE username = 'marta_lopez25')),
((SELECT id FROM users WHERE username = 'dani_garcia10'), (SELECT id FROM users WHERE username = 'lucia_fernandez')),
((SELECT id FROM users WHERE username = 'dani_garcia10'), (SELECT id FROM users WHERE username = 'antonio_gomez1')),
((SELECT id FROM users WHERE username = 'lucia_fernandez'), (SELECT id FROM users WHERE username = 'javi_perez')),
((SELECT id FROM users WHERE username = 'lucia_fernandez'), (SELECT id FROM users WHERE username = 'marta_lopez25')),
((SELECT id FROM users WHERE username = 'lucia_fernandez'), (SELECT id FROM users WHERE username = 'dani_garcia10')),
((SELECT id FROM users WHERE username = 'lucia_fernandez'), (SELECT id FROM users WHERE username = 'antonio_gomez1')),
((SELECT id FROM users WHERE username = 'marta_lopez25'), (SELECT id FROM users WHERE username = 'javi_perez')),
((SELECT id FROM users WHERE username = 'marta_lopez25'), (SELECT id FROM users WHERE username = 'lucia_fernandez')),
((SELECT id FROM users WHERE username = 'marta_lopez25'), (SELECT id FROM users WHERE username = 'dani_garcia10')),
((SELECT id FROM users WHERE username = 'marta_lopez25'), (SELECT id FROM users WHERE username = 'antonio_gomez1'));

INSERT INTO locations (geoname_id, name, country_name, admin_name_1, fcode, lat, lng) VALUES
  (3169070, 'Roma', 'Italia', 'Lacio', 'PPLC', 41.89193, 12.51133),
  (2643743, 'Londres', 'Reino Unido', 'Inglaterra', 'PPLC', 51.50853, -0.12574),
  (2988507, 'París', 'Francia', 'Isla de Francia', 'PPLC', 48.85341, 2.3488),
  (1850147, 'Tokio', 'Japón', 'Tokio', 'PPLC', 35.6895, 139.69171),
  (3117735, 'Madrid', 'España', 'Madrid', 'PPLC', 40.4165, -3.70256),
  (3067696, 'Praga', 'Chequia', 'Praga', 'PPLC', 50.08804, 14.42076),
  (5128581, 'Nueva York', 'EE. UU.', 'Nueva York', 'PPL', 40.71427, -74.00597),
  (3176959, 'Florencia', 'Italia', 'Toscana', 'PPLA', 43.77925, 11.24626),
  (2650225, 'Edimburgo', 'Reino Unido', 'Escocia', 'PPLA', 55.95206, -3.19648);

INSERT INTO itineraries (title, description, image, start_date, end_date, location_id, is_public, user_id) VALUES
  ('Viaje a Roma con amigos', 'Explorando la antigua Roma y su cultura.', 'https://images.pexels.com/photos/2676642/pexels-photo-2676642.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', '2025-04-01', '2025-04-03', (SELECT id FROM locations WHERE geoname_id = 3169070), true, (SELECT id FROM users WHERE username = 'juandaniel16')),
  ('Viaje a Escocia con la familia', 'Recorrido por las tierras altas y castillos escoceses.', 'https://images.pexels.com/photos/3061171/pexels-photo-3061171.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', '2025-04-04', '2025-04-06', (SELECT id FROM locations WHERE geoname_id = 2650225), true, (SELECT id FROM users WHERE username = 'antonio_gomez1')),
  ('Fin de semana en Madrid', 'Disfrutando de la capital de España.', 'https://images.pexels.com/photos/3757144/pexels-photo-3757144.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', '2025-04-07', '2025-04-08', (SELECT id FROM locations WHERE geoname_id = 3117735), true, (SELECT id FROM users WHERE username = 'marta_lopez25')),
  ('Escapada a Londres', 'Visita a los monumentos y museos más emblemáticos de Londres.', 'https://images.pexels.com/photos/672532/pexels-photo-672532.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', '2025-04-09', '2025-04-11', (SELECT id FROM locations WHERE geoname_id = 2643743), true, (SELECT id FROM users WHERE username = 'lucia_fernandez')),
  ('París en primavera', 'Recorriendo la ciudad del amor.', 'https://images.pexels.com/photos/161853/eiffel-tower-paris-france-tower-161853.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', '2025-04-12', '2025-04-13', (SELECT id FROM locations WHERE geoname_id = 2988507), true, (SELECT id FROM users WHERE username = 'dani_garcia10')),
  ('Explorando Tokio', 'Sumergiéndonos en la cultura japonesa.', 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', '2025-04-14', '2025-04-15', (SELECT id FROM locations WHERE geoname_id = 1850147), true, (SELECT id FROM users WHERE username = 'javi_perez')),
  ('Navidad en Nueva York', 'Viviendo la magia navideña en la Gran Manzana.', 'https://images.pexels.com/photos/378570/pexels-photo-378570.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', '2025-04-16', '2025-04-17', (SELECT id FROM locations WHERE geoname_id = 5128581), true, (SELECT id FROM users WHERE username = 'antonio_gomez1')),
  ('Descubriendo Praga', 'Un viaje por la historia y la arquitectura de Praga.', 'https://images.pexels.com/photos/161077/prague-vencel-square-czech-republic-church-161077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', '2025-04-18', '2025-04-19', (SELECT id FROM locations WHERE geoname_id = 3067696), true, (SELECT id FROM users WHERE username = 'marta_lopez25')),
  ('Arte en Florencia', 'Explorando el Renacimiento en Italia.', 'https://images.pexels.com/photos/4179480/pexels-photo-4179480.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', '2025-04-20', '2025-04-20', (SELECT id FROM locations WHERE geoname_id = 3176959), true, (SELECT id FROM users WHERE username = 'lucia_fernandez'));

INSERT INTO itinerary_collaborators (itinerary_id, user_id) VALUES
  ((SELECT id FROM itineraries WHERE title = 'Viaje a Roma con amigos'), (SELECT id FROM users WHERE username = 'antonio_gomez1')),
  ((SELECT id FROM itineraries WHERE title = 'Viaje a Escocia con la familia'), (SELECT id FROM users WHERE username = 'marta_lopez25')),
  ((SELECT id FROM itineraries WHERE title = 'Fin de semana en Madrid'), (SELECT id FROM users WHERE username = 'lucia_fernandez')),
  ((SELECT id FROM itineraries WHERE title = 'Escapada a Londres'), (SELECT id FROM users WHERE username = 'dani_garcia10')),
  ((SELECT id FROM itineraries WHERE title = 'París en primavera'), (SELECT id FROM users WHERE username = 'javi_perez')),
  ((SELECT id FROM itineraries WHERE title = 'Explorando Tokio'), (SELECT id FROM users WHERE username = 'antonio_gomez1')),
  ((SELECT id FROM itineraries WHERE title = 'Navidad en Nueva York'), (SELECT id FROM users WHERE username = 'marta_lopez25')),
  ((SELECT id FROM itineraries WHERE title = 'Descubriendo Praga'), (SELECT id FROM users WHERE username = 'lucia_fernandez')),
  ((SELECT id FROM itineraries WHERE title = 'Arte en Florencia'), (SELECT id FROM users WHERE username = 'dani_garcia10'));

INSERT INTO itinerary_days (itinerary_id, label, day_number) VALUES
  -- Viaje a Roma con amigos
  ((SELECT id FROM itineraries WHERE title = 'Viaje a Roma con amigos'), 'Día 1 - Lunes 1 de abril', 1),
  ((SELECT id FROM itineraries WHERE title = 'Viaje a Roma con amigos'), 'Día 2 - Martes 2 de abril', 2),
  ((SELECT id FROM itineraries WHERE title = 'Viaje a Roma con amigos'), 'Día 3 - Miércoles 3 de abril', 3),
  
  -- Viaje a Escocia con la familia
  ((SELECT id FROM itineraries WHERE title = 'Viaje a Escocia con la familia'), 'Día 1 - Jueves 4 de abril', 1),
  ((SELECT id FROM itineraries WHERE title = 'Viaje a Escocia con la familia'), 'Día 2 - Viernes 5 de abril', 2),
  ((SELECT id FROM itineraries WHERE title = 'Viaje a Escocia con la familia'), 'Día 3 - Sábado 6 de abril', 3),
  
  -- Fin de semana en Madrid
  ((SELECT id FROM itineraries WHERE title = 'Fin de semana en Madrid'), 'Día 1 - Domingo 7 de abril', 1),
  ((SELECT id FROM itineraries WHERE title = 'Fin de semana en Madrid'), 'Día 2 - Lunes 8 de abril', 2),
  
  -- Escapada a Londres
  ((SELECT id FROM itineraries WHERE title = 'Escapada a Londres'), 'Día 1 - Martes 9 de abril', 1),
  ((SELECT id FROM itineraries WHERE title = 'Escapada a Londres'), 'Día 2 - Miércoles 10 de abril', 2),
  ((SELECT id FROM itineraries WHERE title = 'Escapada a Londres'), 'Día 3 - Jueves 11 de abril', 3),
  
  -- París en primavera
  ((SELECT id FROM itineraries WHERE title = 'París en primavera'), 'Día 1 - Viernes 12 de abril', 1),
  ((SELECT id FROM itineraries WHERE title = 'París en primavera'), 'Día 2 - Sábado 13 de abril', 2),
  
  -- Explorando Tokio
  ((SELECT id FROM itineraries WHERE title = 'Explorando Tokio'), 'Día 1 - Domingo 14 de abril', 1),
  ((SELECT id FROM itineraries WHERE title = 'Explorando Tokio'), 'Día 2 - Lunes 15 de abril', 2),
  
  -- Navidad en Nueva York
  ((SELECT id FROM itineraries WHERE title = 'Navidad en Nueva York'), 'Día 1 - Martes 16 de abril', 1),
  ((SELECT id FROM itineraries WHERE title = 'Navidad en Nueva York'), 'Día 2 - Miércoles 17 de abril', 2),
  
  -- Descubriendo Praga
  ((SELECT id FROM itineraries WHERE title = 'Descubriendo Praga'), 'Día 1 - Jueves 18 de abril', 1),
  ((SELECT id FROM itineraries WHERE title = 'Descubriendo Praga'), 'Día 2 - Viernes 19 de abril', 2),
  
  -- Arte en Florencia
  ((SELECT id FROM itineraries WHERE title = 'Arte en Florencia'), 'Día 1 - Sábado 20 de abril', 1);

INSERT INTO itinerary_events (day_id, order_index, label, description, category, image) VALUES
  -- Viaje a Roma con amigos
  (1, 1, 'Llegada al hotel en Roma', 'Check-in en el hotel cerca del Coliseo.', 'accommodation', 'https://images.pexels.com/photos/31145469/pexels-photo-31145469/free-photo-of-vista-nocturna-de-la-calle-con-edificios-iluminados-en-la-ciudad.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),
  (1, 2, 'Visita al Coliseo', 'Explorando una de las maravillas del mundo antiguo.', 'landmark', 'https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),
  (1, 3, 'Cena en Trastevere', 'Disfrutando de la auténtica gastronomía romana.', 'food', 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),
  (1, 4, 'Paseo por el Foro Romano', 'Recorriendo los restos de la antigua Roma.', 'landmark', 'https://images.pexels.com/photos/4846208/pexels-photo-4846208.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),
  
  (2, 1, 'Visita al Vaticano', 'Explorando la ciudad de El Vaticano y la Basílica de San Pedro.', 'landmark', null),
  (2, 2, 'Museos Vaticanos', 'Admirando la famosa colección de arte del Vaticano.', 'art', null),
  (2, 3, 'Cenar en el Panteón', 'Una experiencia gastronómica cerca del Panteón.', 'food', null),
  (2, 4, 'Paseo por la Plaza de España', 'Recorriendo una de las plazas más emblemáticas de Roma.', 'landmark', null),
  
  (3, 1, 'Visita a la Fontana di Trevi', 'Tirando una moneda para asegurar tu regreso a Roma.', 'landmark', null),
  (3, 2, 'Paseo por la Via del Corso', 'Comprando en una de las calles comerciales más famosas de Roma.', 'landmark', null),
  (3, 3, 'Cena en la Piazza Navona', 'Disfrutando de una cena al aire libre en una de las plazas más bellas de Roma.', 'food', null),
  
  -- Viaje a Escocia con la familia
  (4, 1, 'Castillo de Edimburgo', 'Recorriendo la historia escocesa en su castillo más famoso.', 'landmark', 'https://images.pexels.com/photos/27906666/pexels-photo-27906666/free-photo-of-paisaje-naturaleza-vacaciones-punto-de-referencia.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),
  (4, 2, 'Cena en un pub escocés', 'Probando haggis y whisky escocés.', 'food', 'https://images.pexels.com/photos/31087060/pexels-photo-31087060.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),
  (4, 3, 'Paseo por la Royal Mile', 'Disfrutando de la arquitectura medieval de Edimburgo.', 'landmark', 'https://escociatours.com/wp-content/uploads/2023/12/Portada-1.jpg'),
  
  (5, 1, 'Excursión a Loch Ness', 'Buscando al monstruo en el famoso lago.', 'activity', null),
  (5, 2, 'Visita al Museo Nacional de Escocia', 'Conociendo más sobre la historia del país.', 'landmark', null),
  (5, 3, 'Cena en un restaurante de mariscos', 'Disfrutando de mariscos frescos y platos tradicionales.', 'food', null),
  
  (6, 1, 'Excursión a las Highlands', 'Explorando las montañas y paisajes más impresionantes de Escocia.', 'activity', null),
  (6, 2, 'Visita a Stirling', 'Conociendo la historia de la batalla de Stirling.', 'landmark', null),
  
  -- Fin de semana en Madrid
  (7, 1, 'Museo del Prado', 'Disfrutando de las mejores obras de arte en Madrid.', 'art', 'https://res.cloudinary.com/hello-tickets/image/upload/c_limit,f_auto,q_auto,w_1300/v1652924770/agdwabbva2rv0cqhsgwr.jpg'),
  (7, 2, 'Tapas en el Mercado de San Miguel', 'Probando las mejores tapas de la ciudad.', 'food', 'https://www.bypillow.com/wp-content/uploads/2024/03/MERCADO-DE-SAN-MIGUEL-BYPILLOW-1024x683.webp'),
  (7, 3, 'Paseo por el Parque del Retiro', 'Relajándose en el parque más famoso de Madrid.', 'relax', 'https://anpr.org.mx/wp-content/uploads/2023/03/tomado-de-bekia-viajes-anpr-parque-del-mes-1160x560.png'),
  
  (8, 1, 'Visita al Palacio Real', 'Conociendo la residencia oficial de los reyes de España.', 'landmark', null),
  (8, 2, 'Recorrido por la Gran Vía', 'Disfrutando de las tiendas y teatros de la Gran Vía.', 'shopping', null),
  
  -- Escapada a Londres
  (9, 1, 'Big Ben y el Parlamento', 'Conociendo uno de los iconos de Londres.', 'landmark', 'https://images.pexels.com/photos/704930/pexels-photo-704930.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),
  (9, 2, 'Visita a la Torre de Londres', 'Explorando la historia británica.', 'landmark', 'https://images.pexels.com/photos/1443408/pexels-photo-1443408.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),
  (9, 3, 'Recorrido por Covent Garden', 'Disfrutando del ambiente y las tiendas de Covent Garden.', 'shopping', 'https://www.llegarsinavisar.com/wp-content/uploads/2023/07/covent-garden-llegarsinavisar-1-7.jpg'),
  
  (10, 1, 'Visita al Museo Británico', 'Admirando colecciones de todo el mundo.', 'landmark', null),
  (10, 2, 'Recorrido por Hyde Park', 'Disfrutando del famoso parque de Londres.', 'relax', null),
  
  (11, 1, 'Paseo por Notting Hill', 'Conociendo el famoso barrio de Londres.', 'landmark', null),
  (11, 2, 'Cena en un restaurante de cocina británica', 'Probando platos tradicionales británicos.', 'food', null),
  
  -- París en primavera
  (12, 1, 'Torre Eiffel', 'Disfrutando de la vista de París.', 'landmark', 'https://images.pexels.com/photos/2082103/pexels-photo-2082103.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),
  (12, 2, 'Paseo por Montmartre', 'Explorando el barrio de los artistas.', 'landmark', 'https://media.tacdn.com/media/attractions-splice-spp-674x446/15/40/8a/73.jpg'),
  
  (13, 1, 'Visita al Museo del Louvre', 'Viendo obras famosas como la Mona Lisa.', 'art', null),
  (13, 2, 'Cenar en el Barrio Latino', 'Disfrutando de la cocina francesa en una zona típica de París.', 'food', null),
  
  -- Explorando Tokio
  (14, 1, 'Shibuya y Akihabara', 'Explorando la cultura pop de Japón.', 'landmark', 'https://assets.vogue.com/photos/659db809e0e9934642099815/16:9/w_1280,c_limit/1189690204'),
  (14, 2, 'Cena en un izakaya', 'Disfrutando de sake y comida japonesa.', 'food', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/e5/d4/4e/img-20190821-190530-largejpg.jpg?w=900&h=500&s=1'),
  
  (15, 1, 'Paseo por el Templo Senso-ji', 'Visitando el templo más famoso de Tokio.', 'landmark', null),
  (15, 2, 'Tarde en Odaiba', 'Disfrutando de la moderna isla artificial en la bahía de Tokio.', 'relax', null),
  
  -- Navidad en Nueva York
  (16, 1, 'Árbol de Navidad en el Rockefeller Center', 'Viviendo la magia de Nueva York en Navidad.', 'landmark', 'https://dims.apnews.com/dims4/default/345f1c3/2147483647/strip/true/crop/8199x4612+0+427/resize/1440x810!/quality/90/?url=https%3A%2F%2Fassets.apnews.com%2F33%2Fb1%2F66d0815e529cad2ef6f7f32daf46%2F872628ce52b7489eb1f21491c5cf9391'),
  (16, 2, 'Musical en Broadway', 'Viendo un espectáculo en la gran manzana.', 'entertainment', 'https://www.thenation.com/wp-content/uploads/2015/08/solomon_hamilton_otu.jpg'),
  
  (17, 1, 'Paseo por Central Park', 'Disfrutando del invierno en uno de los parques más famosos.', 'relax', null),
  (17, 2, 'Visita a la Estatua de la Libertad', 'Conociendo uno de los íconos más representativos de Estados Unidos.', 'landmark', null),
  
  -- Descubriendo Praga
  (18, 1, 'Puente de Carlos', 'Recorriendo el puente medieval más famoso de Praga.', 'landmark', 'https://images.pexels.com/photos/19492322/pexels-photo-19492322/free-photo-of-ciudad-puente-rio-viaje.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),
  (18, 2, 'Cena en un restaurante checo', 'Probando el famoso goulash.', 'food', 'https://res.cloudinary.com/hello-tickets/image/upload/c_limit,f_auto,q_auto,w_1300/v1647499400/yb8sek2pjddmkdkmiyy3.jpg'),
  
  (19, 1, 'Visita al Castillo de Praga', 'Descubriendo la historia del castillo medieval.', 'landmark', null),
  (19, 2, 'Café en el Café Slavia', 'Disfrutando de un café tradicional checo.', 'food', null),
  
  -- Arte en Florencia
  (20, 1, 'Galería Uffizi', 'Admirando las obras maestras del Renacimiento.', 'art', 'https://cdn-blog.superprof.com/blog_es/wp-content/uploads/2023/01/toscana-italia-galeria-uffizi-visita.jpeg'),
  (20, 2, 'Paseo por el Ponte Vecchio', 'Recorriendo el famoso puente de Florencia.', 'landmark', 'https://images.pexels.com/photos/20265337/pexels-photo-20265337/free-photo-of-ciudad-punto-de-referencia-edificio-puente.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2');

INSERT INTO itinerary_lists (title, description, is_public, user_id) VALUES
  ('Viajes soñados', 'Lista de viajes que me gustaría hacer en el futuro.', true, (SELECT id FROM users WHERE username = 'javi_perez')),
  ('Destinos familiares', 'Itinerarios ideales para viajar en familia con niños.', true, (SELECT id FROM users WHERE username = 'antonio_gomez1')),
  ('Escapadas de fin de semana', 'Viajes cortos perfectos para desconectar.', true, (SELECT id FROM users WHERE username = 'marta_lopez25')),
  ('Ciudades europeas', 'Lista con los mejores itinerarios por ciudades de Europa.', true, (SELECT id FROM users WHERE username = 'lucia_fernandez')),
  ('Experiencias únicas', 'Itinerarios con actividades inolvidables y diferentes.', true, (SELECT id FROM users WHERE username = 'dani_garcia10'));

INSERT INTO itinerary_list_items (list_id, itinerary_id) VALUES
  ((SELECT id FROM itinerary_lists WHERE title = 'Viajes soñados'), (SELECT id FROM itineraries WHERE title = 'Explorando Tokio')),
  ((SELECT id FROM itinerary_lists WHERE title = 'Viajes soñados'), (SELECT id FROM itineraries WHERE title = 'París en primavera')),
  ((SELECT id FROM itinerary_lists WHERE title = 'Destinos familiares'), (SELECT id FROM itineraries WHERE title = 'Viaje a Escocia con la familia')),
  ((SELECT id FROM itinerary_lists WHERE title = 'Escapadas de fin de semana'), (SELECT id FROM itineraries WHERE title = 'Fin de semana en Madrid')),
  ((SELECT id FROM itinerary_lists WHERE title = 'Ciudades europeas'), (SELECT id FROM itineraries WHERE title = 'Descubriendo Praga')),
  ((SELECT id FROM itinerary_lists WHERE title = 'Ciudades europeas'), (SELECT id FROM itineraries WHERE title = 'Arte en Florencia')),
  ((SELECT id FROM itinerary_lists WHERE title = 'Experiencias únicas'), (SELECT id FROM itineraries WHERE title = 'Navidad en Nueva York'));

SELECT * FROM itineraries;
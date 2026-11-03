# Booking Front

Angular 18 (standalone komponente) frontend za Booking ASP.NET API.

## Pokretanje

```bash
npm install
npm start
```

Aplikacija se pokreće na `http://localhost:4200` i poziva API na `http://localhost:5064/api`
(podesivo u `src/environments/environment.ts`).

Backend mora biti pokrenut (`Booking.API`, port 5064). U `Program.cs` su dodati:
- CORS pravilo za `http://localhost:4200`
- `app.UseStaticFiles()` da bi se slike iz `wwwroot/uploads` mogle prikazivati u frontendu

Bez ove dve izmene frontend ne bi mogao da komunicira sa API-jem niti da prikazuje slike.

## Struktura

- `core/models` – TypeScript interfejsi za sve DTO-ove sa backenda
- `core/services` – HTTP servisi (jedan po kontroleru)
- `core/interceptors`, `core/guards` – JWT auth interceptor, auth/role guard-ovi
- `shared` – navbar, paginator
- `features` – po jedna funkcionalna celina (auth, properties, reservations, profile, landlord/*, admin/*)

## Uloge i pristup

- **Gost (Tenant)** – pretraga smeštaja, rezervacije, recenzije, profil
- **Landlord** – sve što i gost, plus upravljanje sopstvenim nekretninama/sobama/cenama/sadržajima i pregled rezervacija gostiju
- **Admin** – sve što i landlord (ali samo nad nekretninama koje sam poseduje, isto kao landlord), plus upravljanje korisnicima, šifarnicima (države, destinacije, sadržaji, uloge, dozvole) i audit logom

## Napomene o izmenama na backendu

- `GET /api/Role` zahteva Admin ulogu, pa forma za registraciju ne može da je koristi. Dodat je novi
  anonimni endpoint `GET /api/Register/roles` (u `RegisterController.cs`) koji vraća stvarne ID-jeve
  uloga iz baze (bez "Admin", da niko ne može sam sebe da registruje kao administratora). Ranije je
  frontend hardkodovao ID-jeve 2/3 pretpostavljajući fiksan redosled seed-ovanja, što je pucalo sa
  `FK_Users_Roles_RoleId` greškom čim baza nije bila seed-ovana tim redosledom - sada se ID-jevi uvek
  učitavaju dinamički.
- `LandlordReservationDTO` (endpoint `GET /api/Reservation/landlord`) je dopunjen poljem `Id`, čime
  je omogućeno da landlord prihvati (potvrdi) rezervaciju direktno sa te liste.
- `PropertyRoomPriceController` je dopunjen `GET /api/price?propertyRoomId=&page=&pageSize=` endpointom
  (ranije nije postojao nikakav način da se pročitaju već postavljene cene za sobu).
- Dodat Swagger (Swashbuckle.AspNetCore) - dostupan na `http://localhost:5064/swagger` kad je API
  pokrenut u Development okruženju. Podržava JWT autorizaciju - klikom na dugme "Authorize" u Swagger UI-ju
  uneti `Bearer {token}` da bi zaštićeni endpointi mogli da se testiraju direktno iz Swagger-a.
- Dodat `POST /api/Property/attach` (dodavanje dodatnih slika postojećoj nekretnini - ranije je
  nekretnina mogla da dobije samo jednu sliku, i to isključivo pri kreiranju).
- Admin sada može sve što i landlord: endpointi `GET /api/Reservation/landlord`, `POST /api/Reservation/confirm`
  i `GET /api/User/landlord/stats` (ranije zaključani samo na "Landlord" ulogu) sada prihvataju i Admin ulogu.
  Scope je isti kao za landlorda - Admin vidi/upravlja samo nekretninama koje on lično poseduje (`OwnerId`),
  ne tuđim. Kad Admin kreira novu nekretninu kroz landlord ekrane, automatski postaje njen vlasnik (validator
  je proširen da prihvati i Admin naloge kao vlasnike, jer je ranije zahtevao striktno ulogu "Landlord").

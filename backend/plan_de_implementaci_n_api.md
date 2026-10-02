# Plan de Implementación: API REST Predicción de Ciclo Menstrual (Spring Boot + MySQL)

Este documento contiene la guía paso a paso y la secuencia de prompts optimizados para ejecutar con **OpenCode** (o asistentes CLI/AI similares). La arquitectura incluye separación por capas (`Controller` -> `Service` -> `Repository`), patrón **DTO**, y **Mappers** explícitos para transformar las entidades sin exponer la base de datos.

---

## 🛠️ Tecnologías y Dependencias
* **Java**: 17+
* **Framework**: Spring Boot 3.x
* **Dependencias**:
  * `spring-boot-starter-web` (API REST)
  * `spring-boot-starter-data-jpa` (Persistencia)
  * `mysql-connector-j` (Driver MySQL)
  * `lombok` (Boilerplate)

---

## 📂 Estructura del Proyecto

```text
src/main/java/com/app/ciclo/
├── controller/
│   └── CycleController.java      <-- Endpoints REST
├── dto/
│   ├── CalculationRequestDTO.java <-- Datos de entrada
│   └── CycleResponseDTO.java     <-- Datos de salida
├── mapper/
│   └── CycleMapper.java          <-- Conversión DTO <-> Entidad
├── model/
│   └── CycleRecord.java          <-- Entidad JPA
├── repository/
│   └── CycleRepository.java      <-- Interface Spring Data
└── service/
    └── CycleCalculationService.java <-- Algoritmo y Lógica
```

---

## 🚀 Prompts por Pasos para OpenCode

Copia y ejecuta estos prompts secuencialmente en tu herramienta de IA:

### Paso 1: Inicialización del Proyecto y Configuración
```text
Crea un proyecto Spring Boot (Java 17+) modular con el paquete raíz `com.app.ciclo`.
Genera el archivo `pom.xml` incluyendo únicamente las dependencias:
- Spring Web (`spring-boot-starter-web`)
- Spring Data JPA (`spring-boot-starter-data-jpa`)
- MySQL Driver (`mysql-connector-j`)
- Lombok (`lombok`)

Luego, crea el archivo `src/main/resources/application.properties` con la configuración de MySQL:
- DB Name: `ciclo_db`
- URL: `jdbc:mysql://localhost:3306/ciclo_db?createDatabaseIfNotExist=true&serverTimezone=UTC`
- Credenciales: user `root`, password `root` (o las estándar)
- `spring.jpa.hibernate.ddl-auto=update`
- `spring.jpa.show-sql=true`
```

---

### Paso 2: Definición de DTOs (Data Transfer Objects)
```text
En el paquete `com.app.ciclo.dto`, crea dos DTOs anotados con Lombok (`@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`):

1. `CalculationRequestDTO`:
   - `LocalDate lastPeriodDate`
   - `int cycleLength`
   - `int periodLength`

2. `CycleResponseDTO`:
   - `Long id`
   - `LocalDate lastPeriodStart`
   - `LocalDate nextPeriodStart`
   - `LocalDate estimatedOvulationDate`
   - `LocalDate fertileWindowStart`
   - `LocalDate fertileWindowEnd`
   - `List<LocalDate> periodDays`
   - `List<LocalDate> fertileDays`
```

---

### Paso 3: Entidad JPA y Repositorio
```text
En el paquete `com.app.ciclo.model`, crea la entidad JPA `CycleRecord`:
- `@Entity` y `@Table(name = "cycle_records")`
- Anotaciones de Lombok para getters, setters y builder.
- `@Id` con `@GeneratedValue(strategy = GenerationType.IDENTITY)` para `Long id`.
- Campos: `LocalDate lastPeriodDate`, `int cycleLength`, `int periodLength`, `LocalDate nextPeriodDate`, `LocalDate ovulationDate`, `LocalDate fertileStart`, `LocalDate fertileEnd`.

En el paquete `com.app.ciclo.repository`, crea la interfaz `CycleRepository` que extienda `JpaRepository<CycleRecord, Long>`.
```

---

### Paso 4: Capa Mapper (Transformación de Objetos)
```text
En el paquete `com.app.ciclo.mapper`, crea la clase `@Component` llamada `CycleMapper`.
Debe contener dos métodos principales:
1. `toEntity(CalculationRequestDTO request, LocalDate nextPeriod, LocalDate ovulation, LocalDate fertileStart, LocalDate fertileEnd)`: convierte la entrada y los datos calculados a una entidad `CycleRecord`.
2. `toDTO(CycleRecord entity, List<LocalDate> periodDays, List<LocalDate> fertileDays)`: mapea la entidad persistida hacia el `CycleResponseDTO`.
```

---

### Paso 5: Capa de Servicio (Lógica del Algoritmo)
```text
En el paquete `com.app.ciclo.service`, crea `CycleCalculationService` anotado con `@Service` e inyecta `CycleRepository` y `CycleMapper` mediante constructor (`@RequiredArgsConstructor`).

Implementa el método `CycleResponseDTO calculateAndSaveCycle(CalculationRequestDTO request)` con las siguientes reglas biomédicas:
1. `nextPeriod = lastPeriodDate + cycleLength` días.
2. `ovulationDate = nextPeriod - 14` días.
3. `fertileStart = ovulationDate - 5` días, `fertileEnd = ovulationDate + 1` día.
4. Construye la lista `periodDays` iterando los días desde `lastPeriodDate` hasta cubrir `periodLength`.
5. Construye la lista `fertileDays` iterando todos los días entre `fertileStart` y `fertileEnd`.
6. Usa el `CycleMapper` para convertir a Entidad, guarda en la base de datos usando `CycleRepository`, y retorna el `CycleResponseDTO` utilizando de nuevo el Mapper.
```

---

### Paso 6: Capa Controller y Configuración CORS
```text
En el paquete `com.app.ciclo.controller`, crea la clase `CycleController`:
- `@RestController`
- `@RequestMapping("/api/v1/cycle")`
- `@CrossOrigin(origins = "*")` (para habilitar futuras peticiones)

Inyecta `CycleCalculationService` y crea el endpoint:
- `@PostMapping("/calculate")`
- Recibe `@RequestBody CalculationRequestDTO request`
- Retorna `ResponseEntity<CycleResponseDTO>` con el resultado del servicio.
```

---

## 🧪 Guía de Pruebas en Postman

Una vez ejecutados los pasos anteriores y con la aplicación corriendo (`mvn spring-boot:run`):

1. **Método**: `POST`
2. **URL**: `http://localhost:8080/api/v1/cycle/calculate`
3. **Headers**:
   * `Content-Type`: `application/json`
4. **Body** (`raw` - `JSON`):
```json
{
  "lastPeriodDate": "2026-09-01",
  "cycleLength": 28,
  "periodLength": 5
}
```

5. **Respuesta Esperada** (`200 OK`):
```json
{
  "id": 1,
  "lastPeriodStart": "2026-09-01",
  "nextPeriodStart": "2026-09-29",
  "estimatedOvulationDate": "2026-09-15",
  "fertileWindowStart": "2026-09-10",
  "fertileWindowEnd": "2026-09-16",
  "periodDays": [
    "2026-09-01",
    "2026-09-02",
    "2026-09-03",
    "2026-09-04",
    "2026-09-05"
  ],
  "fertileDays": [
    "2026-09-10",
    "2026-09-11",
    "2026-09-12",
    "2026-09-13",
    "2026-09-14",
    "2026-09-15",
    "2026-09-16"
  ]
}
```
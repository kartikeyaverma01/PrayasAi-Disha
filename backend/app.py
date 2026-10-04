import os
import bcrypt
import jwt

from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from mysql.connector import IntegrityError


from db import get_db_connection
from recommendation import analyze_student_profile
from recommendation import run_ml_analysis


app = Flask(__name__)

CORS(app)

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-key")


# --------------------------------------------------
# HOME ROUTE
# --------------------------------------------------

@app.route("/")
def home():
    return {
        "message": "PrayasAI Disha Backend is Running!"
    }


# --------------------------------------------------
# REGISTER
# --------------------------------------------------

@app.route("/api/auth/register", methods=["POST"])
def register():

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "No data received"
        }), 400

    # ----------------------------------------------
    # Get frontend data
    # ----------------------------------------------

    full_name = data.get("fullName", "").strip()
    email = data.get("email", "").strip().lower()

    password = data.get("password", "")
    confirm_password = data.get("confirmPassword", "")

    mobile = data.get("mobile", "").strip()
    college = data.get("college", "").strip()
    degree = data.get("degree", "").strip()
    branch_code = data.get("branch", "").strip()

    cgpa = data.get("cgpa")
    graduation_year = data.get("graduationYear")

    skills = data.get("skills", [])

    interests = data.get("interests", "").strip()
    preferred_job_field = data.get("preferredJobField", "").strip()
    preferred_location = data.get("preferredLocation", "").strip()
    preferred_work_mode = data.get("preferredWorkMode", "").strip()


    # ----------------------------------------------
    # Basic validation
    # ----------------------------------------------

    required_fields = {
        "fullName": full_name,
        "email": email,
        "password": password,
        "confirmPassword": confirm_password,
        "mobile": mobile,
        "college": college,
        "degree": degree,
        "branch": branch_code,
        "cgpa": cgpa,
        "graduationYear": graduation_year,
    }

    for field, value in required_fields.items():

        if value is None or value == "":
            return jsonify({
                "message": f"{field} is required"
            }), 400


    # ----------------------------------------------
    # Confirm password
    # ----------------------------------------------

    if password != confirm_password:
        return jsonify({
            "message": "Passwords do not match"
        }), 400


    # ----------------------------------------------
    # Skills validation
    # ----------------------------------------------

    if not isinstance(skills, list) or len(skills) == 0:
        return jsonify({
            "message": "Please select at least one skill"
        }), 400


    # ----------------------------------------------
    # CGPA validation
    # ----------------------------------------------

    try:
        cgpa = float(cgpa)
    except (TypeError, ValueError):

        return jsonify({
            "message": "Invalid CGPA"
        }), 400


    if cgpa < 0 or cgpa > 10:

        return jsonify({
            "message": "CGPA must be between 0 and 10"
        }), 400


    # ----------------------------------------------
    # Database connection
    # ----------------------------------------------

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(dictionary=True)


        # ------------------------------------------
        # Check email already exists
        # ------------------------------------------

        cursor.execute(
            """
            SELECT student_id
            FROM students
            WHERE email = %s
            """,
            (email,)
        )

        existing_student = cursor.fetchone()

        if existing_student:

            return jsonify({
                "message": "An account with this email already exists"
            }), 409


        # ------------------------------------------
        # Find branch ID
        # ------------------------------------------

        cursor.execute(
            """
            SELECT branch_id
            FROM branches
            WHERE branch_code = %s
            """,
            (branch_code,)
        )

        branch = cursor.fetchone()

        if not branch:

            return jsonify({
                "message": "Invalid branch selected"
            }), 400

        branch_id = branch["branch_id"]


        # ------------------------------------------
        # Hash password
        # ------------------------------------------

        password_hash = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")


        # ------------------------------------------
        # Insert student
        # ------------------------------------------

        cursor.execute(
            """
            INSERT INTO students (
                name,
                email,
                password_hash,
                mobile_number,
                college,
                degree,
                graduation_year,
                branch_id,
                cgpa,
                interests,
                preferred_job_field,
                preferred_location,
                preferred_work_mode
            )
            VALUES (
                %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s
            )
            """,
            (
                full_name,
                email,
                password_hash,
                mobile,
                college,
                degree,
                graduation_year,
                branch_id,
                cgpa,
                interests,
                preferred_job_field,
                preferred_location,
                preferred_work_mode
            )
        )

        student_id = cursor.lastrowid


        # ------------------------------------------
        # Insert student skills
        # ------------------------------------------

        for skill_name in skills:

            cursor.execute(
                """
                SELECT skill_id
                FROM skills
                WHERE skill_name = %s
                """,
                (skill_name,)
            )

            skill = cursor.fetchone()

            if not skill:

                connection.rollback()

                return jsonify({
                    "message": f"Invalid skill selected: {skill_name}"
                }), 400


            cursor.execute(
                """
                INSERT INTO student_skills (
                    student_id,
                    skill_id
                )
                VALUES (%s, %s)
                """,
                (
                    student_id,
                    skill["skill_id"]
                )
            )


        # ------------------------------------------
        # Commit transaction
        # ------------------------------------------

        connection.commit()


        # ------------------------------------------
        # Create JWT token
        # ------------------------------------------

        token_payload = {
            "student_id": student_id,
            "email": email,
            "exp": datetime.utcnow() + timedelta(days=7)
        }

        token = jwt.encode(
            token_payload,
            JWT_SECRET,
            algorithm="HS256"
        )


        # ------------------------------------------
        # Response
        # ------------------------------------------

        return jsonify({
            "message": "Registration successful",
            "user": {
                "id": student_id,
                "name": full_name,
                "email": email,
                "role": "student"
            },
            "token": token
        }), 201


    except IntegrityError as error:

        if connection:
            connection.rollback()

        print("Database integrity error:", error)

        return jsonify({
            "message": "Database constraint error"
        }), 400


    except Exception as error:

        if connection:
            connection.rollback()

        print("Registration error:", error)

        return jsonify({
            "message": "Something went wrong while creating your account"
        }), 500


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()



# --------------------------------------------------
# LOGIN
# --------------------------------------------------

@app.route("/api/auth/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "No data received"
        }), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    # ----------------------------------------------
    # Basic validation
    # ----------------------------------------------

    if not email:
        return jsonify({
            "message": "Email is required"
        }), 400

    if not password:
        return jsonify({
            "message": "Password is required"
        }), 400

    connection = None
    cursor = None

    try:

        # ------------------------------------------
        # Database connection
        # ------------------------------------------

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # ------------------------------------------
        # Find student
        # ------------------------------------------

        cursor.execute(
            """
            SELECT
                student_id,
                name,
                email,
                password_hash
            FROM students
            WHERE email = %s
            """,
            (email,)
        )

        student = cursor.fetchone()

        app.logger.info(
            "Login lookup email=%s found=%s",
            email,
            bool(student)
        )

        if not student:
            return jsonify({
                "message": "Invalid email or password"
            }), 401

        # ------------------------------------------
        # Verify password
        # ------------------------------------------

        stored_hash = student["password_hash"]
        if isinstance(stored_hash, bytes):
            stored_hash_bytes = stored_hash.strip()
        elif isinstance(stored_hash, str):
            stored_hash_bytes = stored_hash.strip().encode("ascii")
        else:
            raise TypeError("Unsupported password_hash value from database")

        app.logger.info(
            "Login student_id=%s name=%s hash_length=%d hash_prefix=%s",
            student["student_id"],
            student["name"],
            len(stored_hash_bytes),
            stored_hash_bytes[:4].decode("ascii", errors="replace")
        )

        password_valid = bcrypt.checkpw(
            password.encode("utf-8"),
            stored_hash_bytes
        )

        app.logger.info(
            "Login password verification student_id=%s valid=%s",
            student["student_id"],
            password_valid
        )

        if not password_valid:
            return jsonify({
                "message": "Invalid email or password"
            }), 401

        # ------------------------------------------
        # Create JWT token
        # ------------------------------------------

        token_payload = {
            "student_id": student["student_id"],
            "email": student["email"],
            "exp": datetime.utcnow() + timedelta(days=7)
        }

        token = jwt.encode(
            token_payload,
            JWT_SECRET,
            algorithm="HS256"
        )

        # ------------------------------------------
        # Response
        # ------------------------------------------

        return jsonify({
            "message": "Login successful",
            "user": {
                "id": student["student_id"],
                "name": student["name"],
                "email": student["email"],
                "role": "student"
            },
            "token": token
        }), 200

    except Exception as error:

        print("Login error:", error)

        return jsonify({
            "message": "Something went wrong while logging in"
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


@app.route("/api/profile", methods=["GET"])
def get_profile():

    # Get JWT token
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({
            "message": "Authorization token is required"
        }), 401

    token = auth_header.split(" ")[1]

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )

        student_id = decoded.get("student_id")

    except jwt.ExpiredSignatureError:
        return jsonify({
            "message": "Token has expired"
        }), 401

    except jwt.InvalidTokenError:
        return jsonify({
            "message": "Invalid token"
        }), 401

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Get student + branch
        cursor.execute(
            """
            SELECT
                s.student_id,
                s.name,
                s.email,
                s.mobile_number,
                s.college,
                s.degree,
                b.branch_name,
                b.branch_code,
                s.cgpa,
                s.graduation_year,
                s.interests,
                s.preferred_job_field,
                s.preferred_location,
                s.preferred_work_mode
            FROM students s
            JOIN branches b
                ON s.branch_id = b.branch_id
            WHERE s.student_id = %s
            """,
            (student_id,)
        )

        student = cursor.fetchone()

        if not student:
            return jsonify({
                "message": "Student profile not found"
            }), 404

        # Get skills
        cursor.execute(
            """
            SELECT sk.skill_name
            FROM student_skills ss
            JOIN skills sk
                ON ss.skill_id = sk.skill_id
            WHERE ss.student_id = %s
            """,
            (student_id,)
        )

        skill_rows = cursor.fetchall()

        skills = [
            row["skill_name"]
            for row in skill_rows
        ]

        return jsonify({
            "profile": {
                "id": student["student_id"],
                "fullName": student["name"],
                "email": student["email"],
                "phone": student["mobile_number"],
                "college": student["college"],
                "degree": student["degree"],
                "branch": student["branch_name"],
                "branchCode": student["branch_code"],
                "cgpa": student["cgpa"],
                "graduationYear": str(student["graduation_year"]),
                "skills": skills,
                "interests": (
                    [student["interests"]]
                    if student["interests"]
                    else []
                ),
                "preferredJobField": student["preferred_job_field"],
                "preferredLocation": student["preferred_location"],
                "preferredWorkMode": student["preferred_work_mode"]
            }
        }), 200

    except Exception as error:

        print("Profile error:", error)

        return jsonify({
            "message": "Unable to fetch profile"
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


@app.route("/api/ml/status", methods=["GET"])
def ml_status():
    sample_profile = {
        "skills": ["Python", "SQL", "Machine Learning"]
    }

    return jsonify({
        "service": "ML Analysis Service",
        "status": "connected",
        "analysis": run_ml_analysis(sample_profile),
    }), 200


@app.route("/api/profile", methods=["PUT"])
def update_profile():

    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({
            "message": "Authorization token is required"
        }), 401

    token = auth_header.split(" ")[1]

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )

        student_id = decoded.get("student_id")

    except jwt.ExpiredSignatureError:
        return jsonify({
            "message": "Token has expired"
        }), 401

    except jwt.InvalidTokenError:
        return jsonify({
            "message": "Invalid token"
        }), 401

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "No data received"
        }), 400

    full_name = str(data.get("fullName", "")).strip()
    phone = str(data.get("phone", "")).strip()
    college = str(data.get("college", "")).strip()
    degree = str(data.get("degree", "")).strip()
    preferred_job_field = str(data.get("preferredJobField", "")).strip()
    preferred_location = str(data.get("preferredLocation", "")).strip()
    preferred_work_mode = str(data.get("preferredWorkMode", "")).strip()
    skills = data.get("skills")
    interests = data.get("interests", [])

    if not full_name:
        return jsonify({
            "message": "Full name is required"
        }), 400

    if skills is None or not isinstance(skills, list):
        return jsonify({
            "message": "Skills must be an array"
        }), 400

    if not isinstance(interests, list):
        return jsonify({
            "message": "Interests must be an array"
        }), 400

    try:
        cgpa = float(data.get("cgpa"))
    except (TypeError, ValueError):
        return jsonify({
            "message": "Invalid CGPA"
        }), 400

    if cgpa < 0 or cgpa > 10:
        return jsonify({
            "message": "CGPA must be between 0 and 10"
        }), 400

    try:
        graduation_year = int(data.get("graduationYear"))
    except (TypeError, ValueError):
        return jsonify({
            "message": "Invalid graduation year"
        }), 400

    if graduation_year < 1900 or graduation_year > datetime.utcnow().year + 10:
        return jsonify({
            "message": "Invalid graduation year"
        }), 400

    if preferred_work_mode not in ("", "Remote", "Hybrid", "On-site"):
        return jsonify({
            "message": "Invalid preferred work mode"
        }), 400

    cleaned_skills = []
    for skill in skills:
        if not isinstance(skill, str) or not skill.strip():
            return jsonify({
                "message": "Skills must contain valid names"
            }), 400

        skill_name = skill.strip()
        if skill_name not in cleaned_skills:
            cleaned_skills.append(skill_name)

    cleaned_interests = []
    for interest in interests:
        if not isinstance(interest, str):
            return jsonify({
                "message": "Interests must contain valid names"
            }), 400

        interest_name = interest.strip()
        if interest_name:
            cleaned_interests.append(interest_name)

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT student_id
            FROM students
            WHERE student_id = %s
            """,
            (student_id,)
        )

        if not cursor.fetchone():
            return jsonify({
                "message": "Student profile not found"
            }), 404

        skill_ids = []
        for skill_name in cleaned_skills:
            cursor.execute(
                """
                SELECT skill_id
                FROM skills
                WHERE skill_name = %s
                """,
                (skill_name,)
            )

            skill_row = cursor.fetchone()

            if not skill_row:
                connection.rollback()
                return jsonify({
                    "message": f"Skill not found: {skill_name}"
                }), 400

            skill_ids.append(skill_row["skill_id"])

        cursor.execute(
            """
            UPDATE students
            SET
                name = %s,
                mobile_number = %s,
                college = %s,
                degree = %s,
                cgpa = %s,
                graduation_year = %s,
                interests = %s,
                preferred_job_field = %s,
                preferred_location = %s,
                preferred_work_mode = %s
            WHERE student_id = %s
            """,
            (
                full_name,
                phone,
                college,
                degree,
                cgpa,
                graduation_year,
                ",".join(cleaned_interests),
                preferred_job_field,
                preferred_location,
                preferred_work_mode
                if preferred_work_mode
                else None,
                student_id,
            )
        )

        cursor.execute(
            """
            DELETE FROM student_skills
            WHERE student_id = %s
            """,
            (student_id,)
        )

        for skill_id in skill_ids:
            cursor.execute(
                """
                INSERT INTO student_skills (student_id, skill_id)
                VALUES (%s, %s)
                """,
                (student_id, skill_id)
            )

        connection.commit()

        return jsonify({
            "message": "Profile updated successfully"
        }), 200

    except Exception as error:
        if connection:
            connection.rollback()

        print("Profile update error:", error)

        return jsonify({
            "message": "Unable to update your profile"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()



# --------------------------------------------------
# RUN SERVER
# --------------------------------------------------

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
import { pbkdf2Sync } from 'crypto';

export class User {
	static createConfigJson(): ConfigJson {
		return {
			show_home_table__employee_document: true,
			show_home_table__employee_training: true,
			show_home_table__branch_document: true,
			days_to_warn__employee_document: 30,
			days_to_warn__employee_training: 30,
			days_to_warn__branch_document: 30,
		};
	}

    static isValidId(id: string | undefined): boolean {
        if (id === undefined) return false;
		return /^[\d]+$/.test(id);
    }

	static isValidIdBranch(id_branch: string | undefined): boolean {
		if (id_branch === undefined) return false;
		return /^[\d]+$/.test(id_branch);
	}

	static isValidDeletedFlag(deleted_flag: string | undefined): boolean {
		if (deleted_flag === undefined) return false;
		return /^[0-1]$/.test(deleted_flag);
	}

	static isValidIsAdminFlag(is_admin_flag: string | undefined): boolean {
		if (is_admin_flag === undefined) return false;
		return /^[0-1]$/.test(is_admin_flag);
	}

	static isValidUsername(username: string | undefined): boolean {
		if (username === undefined) return false;
		return /^[a-z]+\.?[a-z]+$/.test(username);
	}

	static isValidName(name: string | undefined): boolean {
		if (name === undefined) return false;
		return /^[a-záâãéêíîóôõúûçA-ZÁÂÃÉÊÍÎÓÔÕÚÛÇ\s]+$/.test(name);
	}

	static isValidEmail(email: string | undefined): boolean {
		if (email === undefined) return false;
		return /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/.test(email);
	}

	static isValidPassword(password: string | undefined): boolean {
		if (password === undefined) return false;
		return password.length === 128;
	}

	static sanitizePassword(password: string) {
		return pbkdf2Sync(password, '', 101, 64, 'sha512').toString('hex');
	}
}

export type ConfigJson = {
	show_home_table__employee_document: boolean;
	show_home_table__employee_training: boolean;
	show_home_table__branch_document: boolean;
	days_to_warn__employee_document: number;
	days_to_warn__employee_training: number;
	days_to_warn__branch_document: number;
};

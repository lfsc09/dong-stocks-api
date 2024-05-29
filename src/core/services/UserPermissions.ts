export class UserPermissions {
	private static PERMISSIONS: Permission[] = [
		{ id: 1, idname: 'EMPLOYEE_ACCESS', group: 'Funcionário', name: 'Acesso ao Módulo' },
		{ id: 2, idname: 'EMPLOYEE_REGISTER', group: 'Funcionário', name: 'Cadastro' },
		{ id: 3, idname: 'EMPLOYEE_EDIT', group: 'Funcionário', name: 'Edição' },
		{ id: 4, idname: 'EMPLOYEE_SDEL', group: 'Funcionário', name: 'Inativação' },
		{ id: 5, idname: 'EMPLOYEE_ACCESS_DOC', group: 'Funcionário', name: 'Acesso a Documentos' },
		{ id: 6, idname: 'EMPLOYEE_EDIT_DOC', group: 'Funcionário', name: 'Edição de Documentos' },
		{ id: 7, idname: 'EMPLOYEE_HDEL_DOC', group: 'Funcionário', name: 'Exclusão de Documentos' },
		{ id: 8, idname: 'EMPLOYEE_ACCESS_TRAI', group: 'Funcionário', name: 'Acesso a Treinamentos' },
		{ id: 9, idname: 'EMPLOYEE_EDIT_TRAI', group: 'Funcionário', name: 'Edição de Treinamentos' },
		{ id: 10, idname: 'USER_ACCESS', group: 'Usuário', name: 'Acesso ao Módulo' },
		{ id: 11, idname: 'USER_REGISTER', group: 'Usuário', name: 'Cadastro' },
		{ id: 12, idname: 'USER_EDIT', group: 'Usuário', name: 'Edição' },
		{ id: 13, idname: 'USER_SDEL', group: 'Usuário', name: 'Inativação' },
		{ id: 14, idname: 'BRANCH_ACCESS', group: 'Local', name: 'Acesso ao Módulo' },
		{ id: 15, idname: 'BRANCH_REGISTER', group: 'Local', name: 'Cadastro' },
		{ id: 16, idname: 'BRANCH_EDIT', group: 'Local', name: 'Edição' },
		{ id: 17, idname: 'BRANCH_SDEL', group: 'Local', name: 'Inativação' },
		{ id: 18, idname: 'BRANCH_ACCESS_DOC', group: 'Local', name: 'Acesso a Documentos' },
		{ id: 19, idname: 'BRANCH_EDIT_DOC', group: 'Local', name: 'Edição de Documentos' },
		{ id: 20, idname: 'BRANCH_HDEL_DOC', group: 'Local', name: 'Exclusão de Documentos' },
	];

	private static PERMISSIONS_ID_FROM_IDNAME = this.PERMISSIONS.reduce((res: { [key: string]: number }, curr: Permission) => {
		res[curr.idname] = curr.id;
		return res;
	}, {});

	/**
	 * Returns the row index where the @param id is
	 */
	private static getIdIndex = (id: number) => {
		return this.PERMISSIONS.findIndex((p: Permission) => p.id === id);
	};

	/**
     * Find the @var id given the @param idname
	 */
	static getID_fromIDName = (idname: string) => {
		return this.PERMISSIONS_ID_FROM_IDNAME[idname];
	};

	/**
     * Returns the system permissions ordered by @param group and then @param name
	 */
	static getPerms = () => {
		const permissions = this.PERMISSIONS.map((p: Permission) => ({ ...p }));
		return permissions.sort((a: Permission, b: Permission) => {
			if (a.group > b.group) return 1;
			else if (a.group < b.group) return -1;
			else if (a.name > b.name) return 1;
			else if (a.name < b.name) return 1;
			else return 0;
		});
	};

	/**
     * Returns the user permissions as a baniry string.
     * The (n)th position in this string refers to the permission(ID)
     *      Given that the first position will be 1, because there is no permission with ID of zero.
     * 
     * If the user has the (n)th permission, the value of this position will be `1`, `0` otherwise.
     * Is the given user permission(ID) does not exist in @var PERMISSIONS, or if the given permission 
     * has empty string as @var PERMISSION.group or @var PERMISSION.name, the value of the position will be `_`.
	 */
	static getPermissionBinary = (user_permissions: { id_permission: number }[] | undefined): string => {
		if (!user_permissions || user_permissions.length === 0) return '';
		// Pega o maior ID cadastrado, e presume que possui este numero de linhas no Array de permissões
		const highest_id: number = this.PERMISSIONS.reduce((highest: number, curr: Permission) => (curr.id > highest ? curr.id : highest), 0);
		let permissions_all = '';
		for (let i = 1; i <= highest_id; i++) {
			// Busca se existe um ID($i)
			let p_indexKey = this.getIdIndex(i);
			if (p_indexKey === -1) permissions_all += '_';
			else {
				// Se o ID tem 'grupo' ou 'nome' vazios considera como inexistente
				if (this.PERMISSIONS[p_indexKey].group === '' || this.PERMISSIONS[p_indexKey].name === '') permissions_all += '_';
				else if (user_permissions.findIndex((el: { id_permission: number }) => el.id_permission === this.PERMISSIONS[p_indexKey].id) !== -1) permissions_all += '1';
				else permissions_all += '0';
			}
		}
		return permissions_all;
	};
}

export type Permission = {
	id: number;
	idname: string;
	group: string;
	name: string;
};

"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Shield, EyeOff, Eye } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useUsers } from "@/hooks/use-users"
import { useRoles } from "@/hooks/use-roles"
import { capitalize } from "@/lib/utils"
import { User } from "@/interfaces/user"
import { usePermissions } from "@/hooks/use-permissions"
import { Role } from "@/interfaces/role"

export default function UsersPage() {
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>({ id: 1, name: "USER", description: "Rol por defecto" });
  const [showPassword, setShowPassword] = useState(false);
  
  const { users, fetchUsers, createUser, updateUser, deleteUser } = useUsers();
  const { roles, fetchRoles, updateRole } = useRoles();
  const { permissions, fetchPermissions } = usePermissions();

  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const hasPermission = (permissionId: number) => selectedPermissionIds.includes(permissionId);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (selectedRole) {
    setSelectedPermissionIds(selectedRole.permissions?.map(p => p.id) ?? []);
    } else {
      setSelectedPermissionIds([]);
    }
  }, [selectedRole]);

  const handleCreateUser = async () => {
    setIsNewUserOpen(false);
    const newUser = {
      firstName,
      lastName,
      username,
      email,
      password,
      isActive: true,
      roles: [role]
    };
    await createUser(newUser);
  }

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsEditUserOpen(true);
  }

  const handleSaveEditedUser = (user: any) => {
    if (editingUser) {
      updateUser(user);
      setIsEditUserOpen(false);
      setEditingUser(null);
    }
  }

  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissionIds(prev =>
      prev.includes(permissionId) ? prev.filter(id => id !== permissionId) : [...prev, permissionId]
    );
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;
     const updatedPermissionsObjects = permissions
    .filter(p => selectedPermissionIds.includes(p.id));

    const updatedRole = {
      ...selectedRole,
      permissions: updatedPermissionsObjects,
    };

    await updateRole(selectedRole.id, updatedRole);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestión de usuarios</h2>
        <p className="text-muted-foreground">Administra usuarios y permisos del sistema</p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="permissions">Permisos</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Usuarios del sistema</CardTitle>
                  <CardDescription>Gestiona los usuarios y sus roles</CardDescription>
                </div>
                <Dialog open={isNewUserOpen} onOpenChange={setIsNewUserOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo usuario
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear nuevo usuario</DialogTitle>
                      <DialogDescription>Ingresa los datos del nuevo usuario</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstname">Nombres</Label>
                        <Input id="firstname" placeholder="Luis Enrique" onChange={(e) => setFirstName(e.target.value)}/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastname">Apellidos</Label>
                        <Input id="lastname" placeholder="Sandoval López" onChange={(e) => setLastName(e.target.value)}/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Nombre de usuario</Label>
                        <Input id="username" placeholder="luisenrique" onChange={(e) => setUsername(e.target.value)}/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="luissandoval@example.com" onChange={(e) => setEmail(e.target.value)}/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input id="password" type="password" placeholder="••••••••" onChange={(e) => setPassword(e.target.value)}/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Rol</Label>
                        <Select onValueChange={(value) => {
                          const selectedRole = roles.find((role) => role.name === value);
                          if (!selectedRole) return;
                          setRole(selectedRole);
                        }}>
                          <SelectTrigger id="role">
                            <SelectValue placeholder="Selecciona un rol" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.name}>{capitalize(role.name)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsNewUserOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateUser}>Crear usuario</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Nombres</TableHead>
                    <TableHead>Apellidos</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell className="font-medium">{user.firstName}</TableCell>
                      <TableCell className="font-medium">{user.lastName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={'outline'}>{capitalize(user.roles?.[0].name ?? '')}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={'outline'}>
                          {user.isActive === true ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteUser(user.id ?? 0)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar usuario</DialogTitle>
                <DialogDescription>Modifica los datos del usuario</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
              <div className="space-y-2">
                  <Label htmlFor="edit-name">Nombres</Label>
                  <Input
                    id="edit-firstname"
                    value={editingUser?.firstName || ""}
                    onChange={(e) => setEditingUser(editingUser ? { ...editingUser, firstName: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastname">Apellidos</Label>
                  <Input
                    id="edit-lastname"
                    value={editingUser?.lastName || ""}
                    onChange={(e) => setEditingUser(editingUser ? { ...editingUser, lastName: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-username">Nombre de usuario</Label>
                  <Input
                    id="edit-username"
                    value={editingUser?.username || ""}
                    onChange={(e) => setEditingUser(editingUser ? { ...editingUser, username: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingUser?.email || ""}
                    onChange={(e) => setEditingUser(editingUser ? { ...editingUser, email: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-password">Nueva contraseña</Label>
                  <div className="relative">
                    <Input
                    id="edit-pwd"
                    type={showPassword ? "text" : "password"}
                    value={editingUser?.password || ""}
                    onChange={(e) => setEditingUser(editingUser ? { ...editingUser, password: e.target.value } : null)}
                  />
                    <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Rol</Label>
                  <Select
                    value={editingUser?.roles?.[0].name}
                    onValueChange={(value) => {
                      const selectedRole = roles.find((role) => role.name === value);
                      if (!selectedRole) return;
                      setEditingUser(editingUser ? { ...editingUser, roles: [selectedRole] } : null)
                    }}
                  >
                    <SelectTrigger id="edit-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>{capitalize(role.name)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Estado</Label>
                  <Select
                    value={editingUser?.isActive ? "active" : "inactive"}
                    onValueChange={(value) =>
                      setEditingUser(editingUser ? { ...editingUser, isActive: value === "active" } : null)
                    }
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditUserOpen(false)
                    setEditingUser(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={() => handleSaveEditedUser(editingUser)}>Guardar cambios</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {roles.map((role) => (
              <Card
                key={role.id}
                className={`cursor-pointer transition-colors ${selectedRoleId === role.id ? "border-primary" : ""}`}
                onClick={() => setSelectedRoleId(role.id)}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">{capitalize(role.name)}</CardTitle>
                  </div>
                  <CardDescription>{capitalize(role.description)}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {selectedRoleId && (
            <Card>
              <CardHeader>
                <CardTitle>Configurar permisos</CardTitle>
                <CardDescription>
                  Configura los permisos para el rol {(selectedRole?.name ?? '').toLocaleLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Permisos</TableHead>
                        <TableHead className="text-center">Habilitado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions.map((permission) => {
                        return (
                          <TableRow key={permission.id}>
                            <TableCell className="font-medium">{permission.description}</TableCell>
                            <TableCell className="text-center">
                              <Switch 
                                checked={hasPermission(permission.id)} 
                                onCheckedChange={() => handleTogglePermission(permission.id)}
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                  <div className="flex justify-end">
                    <Button onClick={handleUpdateRole}>
                      Guardar cambios
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
